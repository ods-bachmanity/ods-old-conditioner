import * as fs from 'fs'
import * as path from 'path'

export class Utilities {

    public static fileExists (filePath: string): Boolean {

        try {
            fs.statSync(filePath)
        }
        catch (err) {
            if (err.code === 'ENOENT') return false
        }
        return true

    }

    public preconditionCheck(): Boolean {
        
        let allGood = true
        if (!Utilities.fileExists(path.join(process.cwd(), '.env'))) {
            console.error(`Missing critical file .env: Create a local .env file 
                as a copy from cfg.env at root of the project. Cannot continue...`)
            allGood = false
        }
        
        const env = require("dotenv").config()
        
        return allGood
        
    }

    public environmentVariables(obfuscate: Array<string>, remove: Array<string>): any {

        const env = process.env
        const result = {}
        Object.keys(env).forEach(key => {
            if (!key.startsWith('npm_') && obfuscate.indexOf(key) < 0 && remove.indexOf(key) < 0) {
                result[key] = env[key]
            }
        })
        if (obfuscate) {
            obfuscate.forEach((item) => {
                result[item + 'EXISTS'] = !!env[item]
            })
        }
        return result

    }

    public readValue(dottedPath: string, source: any): string|any {

        if (dottedPath.indexOf('.') < 0) return source[dottedPath]
        const paths = dottedPath.split('.')
        let reader: any = source
        paths.forEach((element) => {
            if (reader !== null) reader = reader[element]
        })
        return reader

    }

    public writeValue(dottedPath: string, value: any, source: any) {

        if (dottedPath.indexOf('.') < 0) return source[dottedPath] = value
        const paths = dottedPath.split('.')
        let reader: any = source
        paths.forEach((element, index) => {
            if (index >= paths.length - 1) {
                return reader[element] = value
            }
            reader = reader[element]
        })

    }

    public removeElement(dottedPath: string, source: any) {
        if (dottedPath.indexOf('.') < 0) {
            const reader = source
            return delete reader[dottedPath]
        }
        const paths = dottedPath.split('.')
        let reader: any = source
        paths.forEach((element, index) => {
            if (index >= paths.length - 1) {
                return delete reader[element]
            }
            reader = reader[element]
        })
        
    }

    public removeEntireElement(dottedPath: string, source: any) {
        if (dottedPath.indexOf('.') < 0) {
            const reader = source
            return delete reader[dottedPath]
        }
        const paths = dottedPath.split('.')
        let reader: any = source
        let lagged: any = null
        paths.forEach((element, index) => {
            delete reader[element]
        })
    }

    public static safeReadReqBody(req: any, parameterName: string): string {

        if (!req || !req.body) return ''
        return req.body[parameterName]

    }
}