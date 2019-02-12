@fitbit/fdb-debugger
===============

FDB Debugger is a package that can be used to debug Fitbit OS applications.

## Interface
### `class RemoteHost extends EventEmitter`
#### Connect
```
static async connect(
  hostStream: stream.Duplex // stream for communicating with the host,
  {
    userAgentSuffix = '',
    timeout = 10000,
  } = {},
)
```

#### Installing an Fitbit OS Application
```
async installApp(
  componentBundle: 'app' | 'companion',
  data: Buffer,
  {
    onProgress = (() => {}) as (bytesWritten: number, totalBytes: number) => void,
  } = {},
)
```

#### Taking a Screenshot
```
takeScreenshot(
  format: string,
  onWrite?: (received: number, total?: number) => void,
)
```

#### Receiving logs
```
// Console Messages (log, info, warn, error)
remoteHost.on('consoleMessage', (msg: ConsoleMessage) => any);

// Trace Messages (trace, assert, exception)
remoteHost.on('consoleTrace', (msg: TraceMessage) => any));
```
[ConsoleMessage && Trace Message](https://github.com/Fitbit/developer-bridge/tree/master/packages/fdb-protocol#readme)


### Usage
See [sdk-cli](https://github.com/Fitbit/developer-bridge/tree/master/packages/sdk-cli#readme) for an full example of how to use fdb-debugger.

