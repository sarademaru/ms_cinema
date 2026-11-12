import { Logger } from '@nestjs/common';
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ //este decorador indica que esta clase es un gateway de WebSocket y permite configurar opciones como el puerto y la ruta del servidor de WebSocket
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(NotificationsGateway.name);

  @WebSocketServer()
  server?: Server; //este es el servidor de WebSocket que se utiliza para emitir eventos a los clientes conectados. Se inyecta automáticamente por NestJS cuando se inicia el gateway.

  handleConnection(client: Socket): void { //contrato de la interfaz OnGatewayConnection, se ejecuta cuando un cliente se conecta al servidor de WebSocket. En este método, se registra el ID del cliente y se emite un mensaje de bienvenida al cliente.
    this.logger.log(`Nuevo dispositivo conectado: ${client.id}`);
    this.logger.debug(
      `Query del socket: ${JSON.stringify(client.handshake.query)}`,
    );

    client.emit('new_notification', { hello: 'world' });
  }

  handleDisconnect(client: Socket): void { 
    this.logger.log(`Dispositivo desconectado: ${client.id}`);
  }

  @SubscribeMessage('message')
  handleMessage(@MessageBody() data: unknown): string {
    this.logger.log(`Mensaje recibido: ${JSON.stringify(data)}`);
    return 'Mensaje recibido correctamente';
  }

  broadcastNotification(payload: { event: string; data: unknown }): void {
    this.server?.emit(payload.event, payload.data); //event a quien se envia el mensaje  y data que se envia en el mensaje
  }
}
