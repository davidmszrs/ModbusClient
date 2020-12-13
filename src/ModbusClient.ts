import { ModbusPacket } from './ModbusPacket'
import net from 'net'
import { ModbusRequest, ModbusResponse } from './types'

/**
 * Small wrapper for a Modbus TCP client
 *
 * @author David Meszaros
 */

export class ModbusClient {
  private client: net.Socket = new net.Socket()

  /**
   * Small wrapper for a Modbus TCP client
   * @param port - The port on the machine found at ipAddr where the client will connect to
   * @param ipAddr - The target machine's IP address
   * @param onConnect - handler to be executed when a connection is successfully established
   */
  constructor(port: number, ipAddr: string, onConnect: () => void) {
    this.client.connect(port, ipAddr, onConnect)
    this.client.setEncoding('hex')
  }

  /**
   * Attaches a callback function to the socket's error event
   * @param handler - Function to be executed when an error occurs while sending/receiving a packet
   */
  public onError(handler: (error: any) => void) {
    this.client.on('error', handler)
    return this
  }

  /**
   * Attaches a callback function to the socket's close event
   * @param handler - function to be executed when the socket closes
   */
  public onClose(handler: () => void) {
    this.client.on('close', handler)
    return this
  }

  /**
   * Sends a ModbusRequest object to the server
   * @param request - the ModbusRequest object to be sent
   * @param onSent - function to be executed after the packet is sent
   *
   * @returns a Promise<ModbusResponse> which resolves when the server responds with a ModbusResponse
   */
  public async send(request: ModbusRequest, onSent?: () => void): Promise<ModbusResponse> {
    return new Promise((resolve, reject) => {
      this.client.write(new ModbusPacket(Buffer.from([request.functionCode, 0, request.startAddress, 0, request.noOfRegisters, 0]), request.slaveId).getPacket(), onSent ? onSent : undefined)
      this.client.on('data', this.listenerWithRemovalAttached(resolve, reject))
    })
  }

  /**
   * Generates an event listener function that should handle 'data' events
   *
   * @param resolve - Promise resolver that should execute on data arrival
   * @param reject - Promise rejecter that should execute on error
   *
   * @returns a Function that handles the received packet
   */

  private listenerWithRemovalAttached(resolve: (value: ModbusResponse) => void, reject: (reason: any) => void): (tcpResponse: string) => void {
    let that = this
    return function listener(tcpResponse: string) {
      if (typeof tcpResponse !== 'string') {
        that.client.destroy(new Error('Did not receive a string'))
        reject(new Error('Did not receive a string'))
        return
      }
      if (tcpResponse.substr(14, 1) === '8') {
        that.client.destroy(new Error('Invalid request'))
        reject(new Error('Invalid request'))
        return
      }
      that.client.removeListener('data', listener)
      resolve(that.parseResponse(tcpResponse))
    }
  }

  /**
   * Parses the string received from the server
   *
   * @param response - the string response received from the server
   * @returns a ModbusResponse object which contains the parsed response
   */
  private parseResponse(response: string = ''): ModbusResponse {
    if (response)
      return {
        transactionId: parseInt(response.substring(0, 4), 16),
        functionCode: parseInt(response.substring(14, 16), 16),
        noOfRegisters: parseInt(response.substring(16, 18), 16) / 2,
        registerValues: response
          .substring(18)
          .match(/.{1,4}/g)!
          .map(value => parseInt(value, 16))
      }
    else
      return {
        transactionId: -1,
        functionCode: -1,
        noOfRegisters: -1,
        registerValues: []
      }
  }
}
