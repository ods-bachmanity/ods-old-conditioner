import * as assert from 'assert'
import * as restify from 'restify-clients'

const options = {
    path: '/api/conditioner/ntf-2',
    headers: {
        'Content-Type': 'application/json'
    },
    retry: {
        'retries': 0
    },
    agent: false
}

// Creates a JSON client
const client = restify.createJsonClient({
    url: 'http://localhost:8080'
});


client.post(options, {
    fileuri: 'ntf-21-i1',
    fingerprint: '123',
    version: '455'
}, (err, req, res, obj) => {
  
    assert.ifError(err)
    console.log(JSON.stringify(obj, null, 2))

})
// call using console command `node -r ts-node/register sample-test.ts`
// this will call and execute ONLY this file
