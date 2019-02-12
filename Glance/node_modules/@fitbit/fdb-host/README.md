@fitbit/fdb-host
===============

FDB Host is a package that can be used to create a Fitbit Host that can install Fitbit OS applications.

## Interface
### `class Host extends EventEmitter`
#### Create
```
static create(
  debuggerStream: stream.Duplex,
  hostInfo: HostInfo,
  {
    timeout = 10000,
  } = {},
)
```

#### `HostInfo`
```
{
  device: string;
  hostKind: 'device' | 'companion';
  maxMessageSize?: number;
}
```

#### Sending logs
```
// Console Messages (log, info, warn, error)
host.consoleMessage(args: ConsoleMessage);

// Trace Messages (trace, assert, exception)
host.consoleTrace(args: TraceMessage);
```
[ConsoleMessage && Trace Message](https://github.com/Fitbit/developer-bridge/tree/master/packages/fdb-protocol#readme)
