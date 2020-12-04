export type ModbusRequest = {
  functionCode: number;
  slaveId: number;
  startAddress: number;
  noOfRegisters: number;
};

export type ModbusResponse = {
  transactionId: number;
  functionCode: number;
  noOfRegisters: number;
  registerValues: Array<number>;
};
