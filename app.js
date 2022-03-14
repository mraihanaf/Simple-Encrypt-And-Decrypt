import crypto from "crypto"
import inquirer from "inquirer"
import chalk from "chalk"
console.clear()
function encrypt(text,secret){
	// membuat hash dari password dan hashnya di potong menjadi 32 panjangnya
	const key = crypto.createHash("sha256").update(secret).digest("base64").substr(0,32)
	// membuat iv
	const iv = crypto.randomBytes(16)
	const cipher = crypto.createCipheriv("aes-256-cbc",Buffer.from(key),iv)
	let encrypted = cipher.update(text);
	encrypted = Buffer.concat([encrypted, cipher.final()]);
	return iv.toString('hex') + '.' + encrypted.toString('hex');
}

function decrypt(text,secret) {
	const key = crypto.createHash("sha256").update(secret).digest("base64").substr(0,32)
	let textParts = text.split('.');
	let iv = Buffer.from(textParts.shift(), 'hex');
	let encryptedText = Buffer.from(textParts.join('.'), 'hex');
	let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
	let decrypted = decipher.update(encryptedText);

	decrypted = Buffer.concat([decrypted, decipher.final()]);

	return decrypted.toString();
}


async function start(){
console.log(`${chalk.green("Encrypt")} ${chalk.white("And")} ${chalk.green("Decrypt")}`)
console.log("   ",chalk.white("By"),chalk.white.bold("Soni"),"\n")
 const askChoice = await inquirer.prompt({
	name: "choice",
	type: "list",
	choices: ["Encrypt","Decrypt"],
	message: "What do you want?"
 })
 if(askChoice.choice == "Encrypt"){
  const ask1 = await inquirer.prompt({
	name: "msg",
	type: "input",
	message: "Enter a message that you want to encrypt"
  })
  const ask2 = await inquirer.prompt({
	name: "password",
	type: "password",
	message: "Enter a key for your encrypted message",
	validate: (input) => input.trim() == "" ? "Password cant be empty" : true
  })
  await console.log("Encrypted Message : "+chalk.blue(encrypt(ask1.msg,ask2.password)))
  ask() 
} else {
  const ask1 = await inquirer.prompt({
        name: "msg",
        type: "input",
        message: "Enter a encrypted message that you want to decrypt"
  })
  const ask2 = await inquirer.prompt({
        name: "password",
        type: "password",
        message: "Enter a key in your decrypted message",
        validate: (input) => input.trim() == "" ? "Password cant be empty" : true
  })
  try {
  const d = decrypt(ask1.msg,ask2.password)
  console.log("Decrypted Message : "+chalk.blue(d))
  ask() 
} catch {
  console.log(chalk.red("Something Wrong With This Enctyption (Wrong Key, Invalid Encryption)"))
  ask()
}
}
}

async function ask(){
	const ask = await inquirer.prompt({
		name: "run",
		type: "confirm",
		message: "Do you want use this script again now"
	})

	if(ask.run){
		console.log("\n")
		return start()
	 }
	else {

		return process.exit()

	}
}

start()
