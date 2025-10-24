"""
WebSocket Server Implementation for VOICE2EYE
Handles real-time communication for speech and gesture streaming
"""
import asyncio
import json
import logging
import time
from typing import Dict, Any, Set, Optional
from fastapi import WebSocket, WebSocketDisconnect

logger = logging.getLogger(__name__)

class WebSocketManager:
    """Manages WebSocket connections and heartbeats"""
    
    def __init__(self):
        # Store active connections
        self.active_connections: Dict[str, WebSocket] = {}
        self.connection_metadata: Dict[str, Dict[str, Any]] = {}
        # Heartbeat tracking
        self.last_heartbeat: Dict[str, float] = {}
        self.heartbeat_interval = 30  # seconds
        self.heartbeat_timeout = 60   # seconds
        
    async def connect(self, websocket: WebSocket, client_id: str, connection_type: str) -> bool:
        """Accept a new WebSocket connection"""
        try:
            await websocket.accept()
            self.active_connections[client_id] = websocket
            self.connection_metadata[client_id] = {
                "type": connection_type,
                "connected_at": time.time(),
                "last_activity": time.time()
            }
            self.last_heartbeat[client_id] = time.time()
            
            logger.info(f"WebSocket client {client_id} connected (type: {connection_type})")
            return True
        except Exception as e:
            logger.error(f"Failed to accept WebSocket connection for {client_id}: {e}")
            return False
    
    def disconnect(self, client_id: str):
        """Remove a disconnected client"""
        if client_id in self.active_connections:
            del self.active_connections[client_id]
        if client_id in self.connection_metadata:
            del self.connection_metadata[client_id]
        if client_id in self.last_heartbeat:
            del self.last_heartbeat[client_id]
        logger.info(f"WebSocket client {client_id} disconnected")
    
    async def send_personal_message(self, client_id: str, message: str):
        """Send a message to a specific client"""
        if client_id in self.active_connections:
            try:
                await self.active_connections[client_id].send_text(message)
                # Update last activity
                if client_id in self.connection_metadata:
                    self.connection_metadata[client_id]["last_activity"] = time.time()
            except Exception as e:
                logger.error(f"Failed to send message to {client_id}: {e}")
                self.disconnect(client_id)
    
    async def broadcast(self, message: str):
        """Broadcast message to all connected clients"""
        disconnected_clients = []
        for client_id, websocket in self.active_connections.items():
            try:
                await websocket.send_text(message)
                # Update last activity
                if client_id in self.connection_metadata:
                    self.connection_metadata[client_id]["last_activity"] = time.time()
            except Exception as e:
                logger.error(f"Failed to send message to {client_id}: {e}")
                disconnected_clients.append(client_id)
        
        # Clean up disconnected clients
        for client_id in disconnected_clients:
            self.disconnect(client_id)
    
    async def send_json(self, client_id: str, data: Dict[str, Any]):
        """Send JSON data to a specific client"""
        await self.send_personal_message(client_id, json.dumps(data))
    
    async def broadcast_json(self, data: Dict[str, Any]):
        """Broadcast JSON data to all connected clients"""
        await self.broadcast(json.dumps(data))
    
    async def handle_heartbeat(self, client_id: str) -> bool:
        """Handle heartbeat for a client"""
        if client_id not in self.active_connections:
            return False
            
        current_time = time.time()
        self.last_heartbeat[client_id] = current_time
        
        # Send heartbeat response
        try:
            await self.send_json(client_id, {
                "type": "heartbeat",
                "timestamp": current_time,
                "status": "alive"
            })
            return True
        except Exception as e:
            logger.error(f"Failed to send heartbeat to {client_id}: {e}")
            self.disconnect(client_id)
            return False
    
    async def check_connection_health(self):
        """Check all connections for timeouts"""
        current_time = time.time()
        disconnected_clients = []
        
        for client_id, last_heartbeat in self.last_heartbeat.items():
            if current_time - last_heartbeat > self.heartbeat_timeout:
                logger.warning(f"Client {client_id} timed out (no heartbeat)")
                disconnected_clients.append(client_id)
        
        # Clean up timed out clients
        for client_id in disconnected_clients:
            self.disconnect(client_id)
    
    def get_connection_info(self, client_id: str) -> Optional[Dict[str, Any]]:
        """Get connection information for a client"""
        return self.connection_metadata.get(client_id)
    
    def get_all_connections(self) -> Dict[str, Dict[str, Any]]:
        """Get information about all connections"""
        return self.connection_metadata.copy()

# Global WebSocket manager instance
websocket_manager = WebSocketManager()

class WebSocketHandler:
    """Base handler for WebSocket connections"""
    
    def __init__(self, manager: WebSocketManager):
        self.manager = manager
        self.client_id_counter = 0
    
    async def handle_connection(self, websocket: WebSocket, connection_type: str = "generic"):
        """Handle a WebSocket connection"""
        # Generate unique client ID
        self.client_id_counter += 1
        client_id = f"{connection_type}_{self.client_id_counter}_{int(time.time())}"
        
        # Accept connection
        if not await self.manager.connect(websocket, client_id, connection_type):
            return
        
        try:
            # Send connection confirmation
            await self.manager.send_json(client_id, {
                "type": "connection_established",
                "client_id": client_id,
                "timestamp": time.time(),
                "message": f"Connected to {connection_type} WebSocket server"
            })
            
            # Main message loop
            while True:
                try:
                    # Receive message
                    data = await websocket.receive_text()
                    
                    # Handle heartbeat requests
                    if data == "ping":
                        await self.manager.handle_heartbeat(client_id)
                        continue
                    
                    # Handle JSON messages
                    try:
                        message_data = json.loads(data)
                        await self.handle_message(client_id, message_data)
                    except json.JSONDecodeError:
                        # Handle plain text messages
                        await self.handle_text_message(client_id, data)
                        
                except WebSocketDisconnect:
                    logger.info(f"Client {client_id} disconnected")
                    break
                except Exception as e:
                    logger.error(f"Error handling message from {client_id}: {e}")
                    break
                    
        except Exception as e:
            logger.error(f"Error in WebSocket connection for {client_id}: {e}")
        finally:
            # Clean up connection
            self.manager.disconnect(client_id)
    
    async def handle_message(self, client_id: str, message: Dict[str, Any]):
        """Handle JSON messages from clients"""
        message_type = message.get("type", "unknown")
        
        if message_type == "heartbeat":
            await self.manager.handle_heartbeat(client_id)
        elif message_type == "subscribe":
            # Handle subscription requests
            await self.handle_subscription(client_id, message)
        else:
            # Default echo behavior
            await self.manager.send_json(client_id, {
                "type": "echo",
                "original_message": message,
                "timestamp": time.time()
            })
    
    async def handle_text_message(self, client_id: str, message: str):
        """Handle plain text messages from clients"""
        # Default echo behavior
        await self.manager.send_personal_message(client_id, f"Echo: {message}")
    
    async def handle_subscription(self, client_id: str, message: Dict[str, Any]):
        """Handle subscription requests"""
        subscription_type = message.get("subscription", "general")
        
        await self.manager.send_json(client_id, {
            "type": "subscription_confirmed",
            "subscription": subscription_type,
            "timestamp": time.time(),
            "message": f"Subscribed to {subscription_type}"
        })

# Create handler instance
websocket_handler = WebSocketHandler(websocket_manager)

# Background task for connection health checking
async def connection_health_checker():
    """Background task to check connection health"""
    while True:
        try:
            await websocket_manager.check_connection_health()
            await asyncio.sleep(10)  # Check every 10 seconds
        except Exception as e:
            logger.error(f"Error in connection health checker: {e}")
            await asyncio.sleep(10)

# Start health checker
async def start_health_checker():
    """Start the connection health checker"""
    asyncio.create_task(connection_health_checker())