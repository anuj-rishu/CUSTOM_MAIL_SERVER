const SMTPServer = require("smtp-server").SMTPServer;
const simpleParser = require("mailparser").simpleParser;
const fs = require("fs");
const path = require("path");

const mailDir = path.join(__dirname, "emails");
if (!fs.existsSync(mailDir)) {
  fs.mkdirSync(mailDir);
}

const server = new SMTPServer({
  allowInsecureAuth: true,
  authOptional: true,
  onConnect(session, cb) {
    console.log(`New connection from ${session.remoteAddress}`);
    cb();
  },
  onMailFrom(address, session, cb) {
    console.log(`Mail from: ${address.address}`);
    cb();
  },
  onRcptTo(address, session, cb) {
    console.log(`Recipient: ${address.address}`);
    cb();
  },
  onData(stream, session, cb) {
    let mailData = "";

    stream.on("data", (chunk) => {
      mailData += chunk;
    });

    stream.on("end", async () => {
      try {
        const parsed = await simpleParser(mailData);

        const filename = `${Date.now()}_${parsed.subject || "no_subject"}.eml`;
        const filePath = path.join(mailDir, filename);

        fs.writeFileSync(filePath, mailData);

        console.log("Email received:");
        console.log("From:", parsed.from.text);
        console.log("Subject:", parsed.subject);
        console.log("Saved to:", filePath);

        cb();
      } catch (err) {
        console.error("Error processing email:", err);
        cb(new Error("Error processing mail"));
      }
    });
  },
});

const PORT = process.env.PORT || 2525;
server.listen(PORT, () => {
  console.log(`SMTP server is running on port ${PORT}`);
});

server.on("error", (err) => {
  console.error("SMTP Server error:", err);
});
