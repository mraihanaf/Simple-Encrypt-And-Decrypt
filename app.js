import crypto from "crypto"
import inquirer from "inquirer"
import chalk from "chalk"

class ICrypto {
    #encryptionAlgorithm
    #hashAlgorithm

    constructor(encryptionAlgorithm, hashAlgorithm){
        this.#encryptionAlgorithm = encryptionAlgorithm
        this.#hashAlgorithm = hashAlgorithm
    }

    getEncryptionAlgorithm(){
        return this.#encryptionAlgorithm
    }

    getHashAlgorithm() {
        return this.#hashAlgorithm
    }

    encrypt(text, secret){
        throw new Error("Method not Implemented yet.")
    }

    decrypt(){
        throw new Error("Method not implemented yet.")
    }

    _createKeyHash(secret){
        throw new Error("Method not implemented yet.")
    }

    _createIV(){
        throw new Error("Method not implemented yet.")
    }

    _createCipher(key, iv){
        throw new Error("Method not implemented yet.")
    }

    _formatEncrypted(encryptedString){
        throw new Error("Method not implemented yet.")
    }

    _createDecipher(key, iv){
        throw new Error("Method not implemented yet.")
    }
}

class AESCrypto extends ICrypto {
    constructor(){
        super("aes-256-cbc", "sha256") 
    }

    encrypt(text, secret){
        const keyHash = this._createKeyHash(secret)
        const iv = this._createIV()
        const cipher = this._createCipher(keyHash, iv)
        const encryptedText = Buffer.concat([cipher.update(text), cipher.final()])
        return iv.toString("hex") + "." + encryptedText.toString("hex")        
    }

    decrypt(text, secret){
        const key = this._createKeyHash(secret)
        const { iv, encryptedText } = this._formatEncrypted(text)
        const decipher = this._createDecipher(key, iv)
        const decryptedText = Buffer.concat([decipher.update(encryptedText), decipher.final()])
        return decryptedText.toString()
    }

    _createKeyHash(secret){
        return crypto.createHash(this.getHashAlgorithm()).update(secret).digest("base64").substring(0,32)
    }

    _createIV(){
        const iv = crypto.randomBytes(16)
        return iv
    }

    _createCipher(key, iv){
        return crypto.createCipheriv(this.getEncryptionAlgorithm(), Buffer.from(key), iv)
    }

    _createDecipher(key, iv){
        return crypto.createDecipheriv(this.getEncryptionAlgorithm(), Buffer.from(key), iv)
    }

    _formatEncrypted(encryptedString){
        const parts = encryptedString.split(".")
        const iv = Buffer.from(parts.shift(), "hex")
        const encryptedText = Buffer.from(parts.join("."), "hex")
        return { iv, encryptedText }
    }
}

class App {
    constructor(cryptoEngine){
        this.cryptoEngine = cryptoEngine
    }

    async start(){
        this.#printHeader()
        const userChoice = await this.#askUserChoice()

        if(userChoice === "Encrypt"){
            await this.#handleEncryption()
        } else {
            await this.#handleDecryption()
        }

        await this.#askToRunAgain()
    }

    #printHeader(){
        console.log(`${chalk.green("Encrypt")} ${chalk.white("And")} ${chalk.green("Decrypt")}`)
        console.log("   ",chalk.white("By"),chalk.white.bold("Raihan"),"\n")
    }

    async #askUserChoice(){
        const askChoice = await inquirer.prompt({
            name: "choice",
            type: "list",
            choices: ["Encrypt", "Decrypt"],
            message: "What do you want?"
        })
        return askChoice.choice
    }

    async #handleEncryption(){
        const ask1 = await inquirer.prompt({
            name: "msg",
            type: "input",
            message: "Enter a message that you want to encrypt"
        })
        const ask2 = await inquirer.prompt({
            name: "password",
            type: "password",
            message: "Enter a key for your encrypted message",
            validate: (input) => input.trim() === "" ? "Password can't be empty" : true
        })
        const encryptedMessage = this.cryptoEngine.encrypt(ask1.msg, ask2.password)
        console.log("Encrypted Message: " + chalk.blue(encryptedMessage))
    }

    async #handleDecryption(){
        const ask1 = await inquirer.prompt({
            name: "msg",
            type: "input",
            message: "Enter an encrypted message that you want to decrypt"
        })
        const ask2 = await inquirer.prompt({
            name: "password",
            type: "password",
            message: "Enter the key for your decrypted message",
            validate: (input) => input.trim() === "" ? "Password can't be empty" : true
        })
        try {
            const decryptedMessage = this.cryptoEngine.decrypt(ask1.msg, ask2.password)
            console.log("Decrypted Message: " + chalk.blue(decryptedMessage))
        } catch {
            console.log(chalk.red("Something went wrong with this encryption (Wrong Key, Invalid Encryption)"))
        }
        await this.#askToRunAgain()
    }

    async #askToRunAgain(){
        const ask = await inquirer.prompt({
            name: "run",
            type: "confirm",
            message: "Do you want to use this script again?"
        })

        if (ask.run) {
            await this.start()
        } else {
            process.exit()
        }
    }
}

// start the app
const app = new App(new AESCrypto())
app.start()
