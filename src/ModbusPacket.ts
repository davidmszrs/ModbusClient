import { BufferBuilder } from './BufferBuilder'
const PROTOCOL_VERSION = 0

/**
 * Buffer builder for a Modbus 16bit Big Endian Packet
 *
 * @author David Meszaros
 */
export class ModbusPacket {
  private static transactionId = 0

  constructor(private pdu: any, private slaveId: number = 1) {
    this.pdu = pdu
  }

  public getPacket() {
    ModbusPacket.transactionId++
    return new BufferBuilder()
      .word16be(ModbusPacket.transactionId) // transaction id
      .word16be(PROTOCOL_VERSION) // protocol version
      .word16be(this.pdu.length + 1) // pdu length
      .word8(this.slaveId) // unit id
      .put(this.pdu) // the actual pdu
      .buffer()
  }
}
