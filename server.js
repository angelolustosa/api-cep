import * as fs from 'fs';
import axios from 'axios'

const baseDadosCSV = 'base_dados_cep.csv';
const cepsNaoEncontradosCSV = 'ceps_nao_encontrados.csv';

//const baseUrl = 'https://viacep.com.br/ws';
const baseUrl = 'https://brasilaberto.com/api/v1/zipcode'
let url = `${baseUrl}`

async function consultarCEP(cep) {
  try {
    //const response = await axios.get(`${baseUrl}/${cep}/json`);

    url = `${baseUrl}/${cep}`
    console.log(url);
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(`Erro ao consultar o CEP ${cep}: ${error.message}`);
    return { erro: true };
  }
}

async function obterCEPsNoRange(inicio, fim) {
  const baseDados = [];
  const cepsNaoEncontrados = [];

  fs.writeFileSync(cepsNaoEncontradosCSV, 'CEP,BaseURL\n');
  fs.writeFileSync(baseDadosCSV, 'street,complement,district,districtId,city,cityId,ibgeId,state,stateShortname,zipcode,BaseURL\n');

  for (let i = inicio; i <= fim; i++) {
    const cep = i.toString().padStart(8, '0'); // Formata o número como um CEP

    const endereco = await consultarCEP(cep);

    if (endereco.erro) {
      //cepsNaoEncontrados.push(cep);
      const csvRow = `${cep},${url}\n`;
      saveFile(cepsNaoEncontradosCSV, csvRow,cep)
      console.log(`CEP ${cep} não encontrado`);
    } else {
      //baseDados.push(endereco);
      saveFile(baseDadosCSV, endereco.result, cep)
    }
  }

//   // Salvar os resultados em CSV
//   const csvHeader = Object.keys(baseDados[0]).join(',');

//   const baseDadosCSVContent = baseDados.map((endereco) =>
//     Object.values(endereco).join(',')
//   );

//   const cepsNaoEncontradosCSVContent = cepsNaoEncontrados.join('\n');

//   fs.writeFileSync(baseDadosCSV, csvHeader + '\n' + baseDadosCSVContent.join('\n'));
//   fs.writeFileSync(cepsNaoEncontradosCSV, cepsNaoEncontradosCSVContent);

//   console.log('Arquivos CSV gerados com sucesso.');
}

const saveFile = async (nomeArquivo, data, cep) => {
    
  if(data.zipcode === cep) {
    let rows = Object.values(data).join(',')
    //console.log(rows);
    fs.appendFileSync(nomeArquivo, `${rows}\n`);
    console.log(`CEP ${data.zipcode} inserido com sucesso! em ${nomeArquivo}`);
  } else {
    fs.appendFileSync(nomeArquivo, data);
    console.log(`CEP ${data.split(',')[0]} inserido com sucesso em ${nomeArquivo}!`);
  }

  
}

// Obtém os argumentos de início e fim do intervalo da linha de comando
const args = process.argv.slice(2);
const inicio = parseInt(args[0]);
const fim = parseInt(args[1]);

if (isNaN(inicio) || isNaN(fim)) {
  console.error('Forneça os valores de início e fim do intervalo.');
} else {
  obterCEPsNoRange(inicio, fim);
}

//obterCEPsNoRange(60000000, 63999999);
