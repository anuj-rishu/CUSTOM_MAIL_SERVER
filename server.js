const SMTPServer = require("smtp-server").SMTPServer;

const server = new SMTPServer({
  allowInsecureAuth: true,
  allowOptional: true,
  onConnect(session, cb) {
    console.log(`on connect `, session.id);
    cb();
  },
  onMailFrom(address, session, cb) {
    console.log(`on mailfrom`, address.address, session.id);
    cb();
  },

  onRcptTo(address, session, cb) {
    console.log(`on recptTo`, address.address, session.id);
    cb();
  },
  onData(stream, session, cb) {
    stream.on((data) => console.log(`onData ${data.toString()}`));
    stream.on(`end`, cb);
  },
});

server.listen(25, () => {
  console.log("server is running on smtp port 25");
});
