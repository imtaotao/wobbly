const fs = require('fs')
const path = require('path')

const libName = 'wobbly'
const entryFilePath = path.resolve('./index.js')
const destinationFolder = path.resolve('./dist')

const build = (sourcecode, type) => {
  const filename = `${libName}.${type}.js`
  const desPath = path.resolve(destinationFolder, filename)
  
  switch (type) {
    case 'esm' :
      sourcecode += '\nexport default Wobbly'
      break
    case 'common' :
      sourcecode += '\nmodule.exports = Wobbly'
      break
    case 'browser' :
      sourcecode += '\nwindow.Wobbly = Wobbly'
      break
  }

  if (!fs.existsSync(destinationFolder)) {
    fs.mkdirSync(destinationFolder)
  }

  fs.writeFile(desPath, sourcecode, err => {
    if (err) throw err
    console.log(`Build success "${filename}".`)
  })
}

const getSourceCode = () => {
  return new Promise(resolve => {
    if (fs.existsSync(entryFilePath)) {
      fs.readFile(entryFilePath, (err, data) => {
        if (err) throw err
        resolve(data.toString())
      })
    }
  })
}

const start = () => {
  getSourceCode(entryFilePath).then(sourcecode => {
    build(sourcecode, 'esm')
    build(sourcecode, 'common')
    build(sourcecode, 'browser')
  })
}

start()

// if need watch file
let rebuildIndex = 0
if (process.argv.includes('-w')) {
  fs.watchFile(entryFilePath,  () => {
    console.clear()
    console.log(`rebuild... (${++rebuildIndex})`)
    start()
  })
}
