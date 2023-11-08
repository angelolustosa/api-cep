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
    //console.log(url);
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.log(`\n===================== [${cep} NÃO EXISTE!] ====================`);
    console.error(`Erro ao consultar o CEP ${cep}: ${error.message}`);
    return { erro: true };
  }
}

async function obterCEPsNoRange(inicio, fim) {
  const baseDados = [];
  const cepsNaoEncontrados = [];

  //fs.writeFileSync(cepsNaoEncontradosCSV, 'CEP,BaseURL\n');
  verificarEIniciarArquivo(cepsNaoEncontradosCSV, 'CEP,BaseURL\n');
  //fs.writeFileSync(baseDadosCSV, 'street,complement,district,districtId,city,cityId,ibgeId,state,stateShortname,zipcode,BaseURL\n');
  verificarEIniciarArquivo(baseDadosCSV, 'street,complement,district,districtId,city,cityId,ibgeId,state,stateShortname,zipcode,BaseURL\n');

  for (let i = inicio; i <= fim; i++) {
    const cep = i.toString().padStart(8, '0'); // Formata o número como um CEP

    const jaExisteNoCSV = await verificarCEPNoCSV(baseDadosCSV, 9, cep);

    if (jaExisteNoCSV) {
      console.log(`CEP ${cep} já existe no CSV.`);
      continue;
    }

    const endereco = await consultarCEP(cep);

    if (endereco.erro) {
      //cepsNaoEncontrados.push(cep);
      const csvRow = `${cep},${url}\n`;
      saveFile(cepsNaoEncontradosCSV, csvRow, cep)
      //console.log(`CEP ${cep} não encontrado`);
    } else {
      console.log(`\n============================== [${cep} SUCESSO] =============================`);
      //baseDados.push(endereco);
      saveFile(baseDadosCSV, endereco.result, cep)
    }
  }
}

const verificarCEPNoCSV = async (nomeArquivo, posicaoCampoHeader, cep) => {
  const csvContent = fs.readFileSync(nomeArquivo, 'utf8');
  const lines = csvContent.split('\n').slice(1); // Ignorar o cabeçalho

  for (const line of lines) {
    const lineData = line.split(',');
    if (lineData[posicaoCampoHeader] === cep) {
      return true; // CEP já existe no CSV
    }
  }

  return false; // CEP não existe no CSV
}

async function verificarEIniciarArquivo(nomeArquivo, header) {
  if (!fs.existsSync(nomeArquivo)) {
    fs.writeFileSync(nomeArquivo, header);
  }
}
const saveFile = async (nomeArquivo, data, cep) => {

  if (data.zipcode === cep) {
    let rows = Object.values(data).join(',')
    //rows.join(`,${url}`)

    console.log(rows);

    fs.appendFileSync(nomeArquivo, `${rows},${url}\n`);
    console.log('')
    console.log(`[OK] CEP ${data.zipcode} inserido com sucesso! em ${nomeArquivo}`);
    //console.log(`\n===================== [FIM - INSERIDO NA BASE] ======================`);
  } else {

    const jaExisteNoCSV = await verificarCEPNoCSV(cepsNaoEncontradosCSV, 0, cep);

    if (jaExisteNoCSV) {
      console.log(`CEP ${cep} já existe no CSV.`);
    } else {
      fs.appendFileSync(nomeArquivo, data);
      console.log(`[NOT_FOUND] CEP ${data.split(',')[0]} inserido com sucesso em ${nomeArquivo}!`);
      //console.log('\n========================== [${cep} IGNORADO] ========================== ');
    }

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
