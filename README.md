# ModbusClient

A wrapper for TCP sockets built for the Modbus protocol.

## Installation

To install the package simply run the following command

    npm install modbusclient

## Usage

The package provides a central utility `ModbusClient` class which implements various methods for handling communications with a Modbus server.

### Creating the client

```javascript
import { ModbusClient } from 'modbusclient'

const client = new ModbusClient(502, '127.0.0.1', () => console.log('Connected'))
```

As seen above, the constructor takes 3 arguments: the port where the Modbus Server is listening on, the IP address of the machine on which the server runs on and a callback function which is executed once a connection has been established.

### Sending a request

To send a request, you need to use the `send` method defined on the `ModbusClient` class, which takes as its only argument a `ModbusRequest` object.

The `ModbusRequest` object contains the following properties:

- `functionCode` - the Modbus function code to be requested;
- `noOfRegisters` - the total number of register values to be returned;
- `slaveId` - the slave from which to request data;
- `startAddress` - the register from which `noOfRegisters` register values will be returned.

```javascript
let request = {
  // Read Input Registers Function
  functionCode: 4,
  // Requesting 3 register values
  noOfRegisters: 3,
  // The Modbus Slave from which data is requested
  slaveId: 0,
  // The first register to read values from
  startAddress: 10
}

// Sending the request
client.send(request)
```

### The Response object

The response object contains the following properties:

- `transactionId` - the order number of the current response;
- `functionCode` - the function code which was previously requested;
- `noOfRegisters` - the total number of registers returned;
- `registerValues` - array of integers which contain the requested register values.

### Receiving the response

The client implements a Promise based API, therefore the `send` method returns a `Promise` which resolves once a response is received from the server. As such, the response is passed as an argument to the Promises' `then` method. If the request fails, the `Promise` rejects with an appropriate error message.

```javascript
client
  .send(request)
  // Processing the response
  .then(response => log(response))
  // Handling possible errors
  .catch(err => console.log(err))

function log(response) {
  console.log(`Transaction ID: ${response.transactionId}`)
  console.log(`Function code: ${response.functionCode}`)
  console.log(`Total number of registers: ${response.noOfRegisters}`)
  console.log(`Values: ${response.values.join(', ')}`)
}
```

If the above snippet encounters no errors, the displayed result will be:

```
Transaction ID: 1
Function code: 4
Total number of registers: 3
Values: 2, 3, 10
```

### ES6 Async / Await

You can also use the ES6 `async` / `await` syntactic sugar to make the code look synchronous. The following example should produce the same result as the previous one:

```javascript
function log(response) {
  console.log(`Transaction ID: ${response.transactionId}`)
  console.log(`Function code: ${response.functionCode}`)
  console.log(`Total number of registers: ${response.noOfRegisters}`)
  console.log(`Values: ${response.values.join(', ')}`)
}

async function example() {
  try {
    const response = await client.send(request)
    log(response)
  } catch (error) {
    console.log(`Error: ${error}`)
  }
}

example()
```

### TypeScript

Additional type annotations for the `ModbusRequest` and `ModbusResponse` objects can be imported with:

```typescript
import { ModbusRequest, ModbusResponse } from 'modbusclient/types'
import { ModbusClient } from 'modbusclient'

const client: ModbusClient = new ModbusClient(502, '127.0.0.1', () => {})
const request: ModbusRequest = {
  functionCode: 4,
  noOfRegisters: 3,
  slaveId: 0,
  startAddress: 10
}
client.send(request).then((response: ModbusResponse) => console.log(response))
```
