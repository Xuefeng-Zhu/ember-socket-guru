import SocketIOClient from 'ember-socket-guru/socket-clients/socketio';
import { module, test } from 'qunit';
import sinon from 'sinon';
import Ember from 'ember';

const { get } = Ember;

module('Unit | Socket Clients | socketio');

const createIoStub = (
  connect = () => {},
  on = () => {},
  disconnect = () => {}
) => {
  return () => ({ connect, on, disconnect });
};

test('verifies required socket.io config options', function(assert) {
  const client = SocketIOClient.create();

  assert.throws(() => {
    client.setup();
  }, /need to provide host/, 'it throws when no host present');
});

test('verifies socketio client library passed in', function(assert) {
  const client = SocketIOClient.create({
    ioService: null,
  });

  assert.throws(
    () => client.setup('http://locahost:1234'),
    /need to make sure the socket.io client library/,
    'it throws when socketio client not installed'
  );
});

test('setup function', function(assert) {
  const connectSpy = sinon.spy();
  const ioStub = sinon.spy(() => ({
    connect: connectSpy,
  }));
  const eventHandlerSpy = sinon.spy();
  const client = SocketIOClient.create({
    ioService: ioStub,
  });

  client.setup('http://localhost:1234', eventHandlerSpy);

  assert.ok(ioStub.calledOnce);
  assert.equal(ioStub.args[0][0], 'http://localhost:1234');
  assert.ok(connectSpy.calledOnce);
  assert.equal(get(client, 'eventHandler'), eventHandlerSpy);
});

test('subscribe method', function(assert) {
  const onSpy = sinon.spy();
  const ioStub = createIoStub(() => {}, onSpy);
  const client = SocketIOClient.create({
    ioService: ioStub,
  });

  const handlerSpy = sinon.spy().bind(this);

  client.setup('foo', handlerSpy);
  client.subscribe(['event1', 'event2']);

  const [firstCallArgs, secondCallArgs] = onSpy.args;

  assert.deepEqual(firstCallArgs, ['event1', handlerSpy]);
  assert.deepEqual(secondCallArgs, ['event2', handlerSpy]);
});

test('disconnect method', function(assert) {
  const disconnectSpy = sinon.spy();
  const client = SocketIOClient.create({
    ioService: createIoStub(sinon.spy(), sinon.spy(), disconnectSpy),
  });

  client.setup('host', sinon.spy());
  client.disconnect();

  assert.ok(disconnectSpy.calledOnce);
});
