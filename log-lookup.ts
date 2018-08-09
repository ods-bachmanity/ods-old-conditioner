import * as _ from 'lodash'
const path = require('path')
const fs = require('fs-extra')
const readline = require('readline');

class Executor {

    private _records: Array<any> = []

    public load() {

        const result = new Promise((resolve, reject) => {

            try {
                const logpath = path.join(process.cwd(),'logs','combined.log')
                console.log(`Loading log from ${logpath}`)
                //const all = fs.readFileSync(logpath, 'utf8')
                const all = []

                var rl = readline.createInterface({
                    input : fs.createReadStream(logpath),
                    output: null
                })

                rl.on('line', (line) => {
                    line = line.trim()
                    const record = JSON.parse(line)
                    all.push(record)
                })

                rl.on('close', () => {
                    if (!all || all.length <= 0) {
                        console.error(`Unable to load combined record log. Process terminated...`)
                        process.exit(1)
                    }
        
                    this._records = all
                    console.log(`Loaded ${this._records.length} records`)
                    return resolve(this._records)
                })
    
            }
            catch (err) {
                console.error(`ERROR executing log-lookup\n`)
                console.error(err)
                process.exit(1)
                return reject(err)
            }        
    
        })

        return result
    }

    public lookup(correlationId: string): any {

        return _.filter(this._records, {correlationId: correlationId})

    }
}

const ex = new Executor()
ex.load().then((records) => {

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: 'CORRELATION ID:> '
    })
    
    rl.prompt()
    
    rl.on('close', () => {
        console.log('Have a great day!')
        process.exit(0)
    }).on('line', async(line) => {
        line = line.trim()
        if (line.toLowerCase() === 'quit' || line.toLowerCase()==='close'||line.toLowerCase()==='exit') {
            rl.close()
        }
        const lookup = await ex.lookup(line)
        if (!lookup) {
            console.log(`No records found for correlation id: ${line}`)
            return rl.prompt()
        }
    
        console.log(JSON.stringify(lookup,null,1))
    
        rl.prompt()
    })

}).catch((err) => {
    console.error(`Error running log parser: \n${err}`)
})

