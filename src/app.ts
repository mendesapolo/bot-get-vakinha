import * as puppeteer from 'puppeteer'
import * as path from 'path';
import * as fs from 'fs';

const url: string = 'https://www.vakinha.com.br/vaquinhas/explore';

interface Vakinha {
    title: string;
    categoryAndID: string;
    user: string;
    colleted: string;
    goal: string;
}

async function execute() {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto(url)

    console.log("carregando...")
    const dataArray = await page.$eval('#__next', (el) => {
        const data: Vakinha[] = []
        const cards: ChildNode[] = []
        el.childNodes[2].childNodes[1].childNodes.forEach(child => {
            cards.push(child.childNodes[0].childNodes[0].childNodes[0])
        })

        cards.forEach(item => {
            data.push({
                title: item?.childNodes[1]?.textContent ?? '---',
                categoryAndID: item?.childNodes[2]?.textContent ?? '---',
                user: item?.childNodes[3]?.textContent ?? '---',
                colleted: item?.childNodes[5]?.textContent ?? '---',
                goal: item?.childNodes[7]?.textContent ?? '---',
            })
        })
        return data
    })
    // console.log(dataArray)
    console.log("*** Carregado ***")
    await browser.close()

    // tratando os dados de returno do site
    if (dataArray.length > 0) {
        const timestamp = new Date().toISOString().split('T')[0].replace(new RegExp('-', 'g'),'')+(new Date().toTimeString().split(' ')[0].replace(new RegExp(':','g'), ''))
        const filename = path.join(__dirname, 'files') + '/vakinha_' + timestamp + '.json'
        fs.writeFile(filename, JSON.stringify(dataArray), (err) => {
            if (err) {
                console.log(err)
                return 
            }
            console.log("Arquivo salvo em 'files/"+filename+"'")
        })
        return filename
    } else {
        console.log("Sem dados de returno")
    }

}

execute()