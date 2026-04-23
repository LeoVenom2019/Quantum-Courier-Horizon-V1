'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, RotateCcw, Award, Info, BrainCircuit, MessageSquare } from 'lucide-react';

import { Language } from '@/lib/i18n';

interface Question {
  id: number;
  text: string;
  options: string[];
  correct: number;
}

interface ThemeInfoWindowProps {
  isOpen: boolean;
  onClose: () => void;
  themeId: string;
  language: Language;
}

const MOON_QUESTIONS: Question[] = [
  {
    id: 1,
    text: 'Qual é a distância média da Lua até a Terra?',
    options: ['150.000 km', '384.400 km', '1 milhão km', '50.000 km'],
    correct: 1,
  },
  {
    id: 2,
    text: 'Qual missão levou o primeiro humano à Lua?',
    options: ['Apollo 10', 'Apollo 11', 'Apollo 13', 'Gemini'],
    correct: 1,
  },
  {
    id: 3,
    text: 'Quem foi o primeiro humano a pisar na Lua?',
    options: ['Buzz Aldrin', 'Yuri Gagarin', 'Neil Armstrong', 'Elon Musk'],
    correct: 2,
  },
  {
    id: 4,
    text: 'O que causa as marés na Terra?',
    options: ['Vento', 'Rotação da Terra', 'Gravidade da Lua', 'Temperatura'],
    correct: 2,
  },
  {
    id: 5,
    text: 'Quanto tempo dura o ciclo lunar?',
    options: ['7 dias', '15 dias', '29,5 dias', '60 dias'],
    correct: 2,
  },
  {
    id: 6,
    text: 'A Lua possui atmosfera densa?',
    options: ['Sim', 'Não'],
    correct: 1,
  },
  {
    id: 7,
    text: 'A Lua está:',
    options: ['Se aproximando da Terra', 'Se afastando da Terra'],
    correct: 1,
  },
  {
    id: 8,
    text: 'Quantas fases principais a Lua tem?',
    options: ['2', '3', '4', '8'],
    correct: 2,
  },
  {
    id: 9,
    text: 'A Lua influencia:',
    options: ['Vulcões', 'Marés', 'Terremotos diretamente', 'Clima global totalmente'],
    correct: 1,
  },
  {
    id: 10,
    text: 'A Lua é:',
    options: ['Um planeta', 'Uma estrela', 'Um satélite natural', 'Um cometa'],
    correct: 2,
  },
];

const EARTH_QUESTIONS: Question[] = [
  {
    id: 1,
    text: 'Qual porcentagem da Terra é coberta por água?',
    options: ['50%', '71%', '30%', '90%'],
    correct: 1,
  },
  {
    id: 2,
    text: 'Quantas pessoas vivem aproximadamente na Terra?',
    options: ['5 bilhões', '6 bilhões', '8 bilhões ou mais', '10 bilhões'],
    correct: 2,
  },
  {
    id: 3,
    text: 'Qual é a maior floresta tropical do mundo?',
    options: ['Congo', 'Amazônia', 'Taiga', 'Cerrado'],
    correct: 1,
  },
  {
    id: 4,
    text: 'A Terra é o:',
    options: ['1º planeta', '2º planeta', '3º planeta', '4º planeta'],
    correct: 2,
  },
  {
    id: 5,
    text: 'A maior parte da água da Terra é:',
    options: ['Doce', 'Salgada'],
    correct: 1,
  },
  {
    id: 6,
    text: 'Quantos continentes existem?',
    options: ['5', '6', '7', '8'],
    correct: 1,
  },
  {
    id: 7,
    text: 'O que protege a Terra da radiação solar?',
    options: ['Núcleo', 'Atmosfera', 'Oceanos', 'Lua'],
    correct: 1,
  },
  {
    id: 8,
    text: 'A Terra possui vida porque:',
    options: ['É quente demais', 'Tem água, atmosfera e temperatura adequada', 'Está longe do Sol', 'Não gira'],
    correct: 1,
  },
  {
    id: 9,
    text: 'A idade aproximada da Terra é:',
    options: ['1 bilhão', '2 bilhões', '4,5 bilhões', '10 bilhões'],
    correct: 2,
  },
  {
    id: 10,
    text: 'Qual destes NÃO é um continente?',
    options: ['Europa', 'Oceania', 'Atlântida', 'África'],
    correct: 2,
  },
];

const ALIEN_QUESTIONS: Question[] = [
  {
    id: 1,
    text: 'O universo possui:',
    options: ['Apenas uma galáxia', 'Bilhões de galáxias', '10 galáxias', '100 galáxias'],
    correct: 1,
  },
  {
    id: 2,
    text: 'O Caso Varginha ocorreu em qual país?',
    options: ['EUA', 'Brasil', 'Rússia', 'Japão'],
    correct: 1,
  },
  {
    id: 3,
    text: 'O incidente de Roswell ocorreu em:',
    options: ['1990', '2001', '1947', '1985'],
    correct: 2,
  },
  {
    id: 4,
    text: 'O que o governo dos EUA disse sobre Roswell depois?',
    options: ['Era nave alienígena', 'Era um satélite', 'Era um balão meteorológico', 'Era um avião'],
    correct: 2,
  },
  {
    id: 5,
    text: 'Existe prova científica confirmada de vida alienígena?',
    options: ['Sim', 'Não'],
    correct: 1,
  },
  {
    id: 6,
    text: 'O projeto SETI busca:',
    options: ['Minerais', 'Sinais de vida inteligente', 'Água', 'Energia'],
    correct: 1,
  },
  {
    id: 7,
    text: 'A Via Láctea é:',
    options: ['Um planeta', 'Uma estrela', 'Uma galáxia', 'Um cometa'],
    correct: 2,
  },
  {
    id: 8,
    text: 'O Caso Varginha envolveu:',
    options: ['Apenas luzes no céu', 'Relatos de criaturas estranhas', 'Apenas radares', 'Satélites'],
    correct: 1,
  },
  {
    id: 9,
    text: 'Cientistas procuram vida em:',
    options: ['Planetas habitáveis', 'Apenas estrelas', 'Buracos negros', 'Asteroides apenas'],
    correct: 0,
  },
  {
    id: 10,
    text: 'A existência de aliens é:',
    options: ['Comprovada', 'Impossível', 'Ainda não comprovada, mas possível', 'Já descartada'],
    correct: 2,
  },
];

const CHESS_QUESTIONS: Question[] = [
  {
    id: 1,
    text: 'Onde surgiu o xadrez?',
    options: ['China', 'Índia', 'Egito', 'Grécia'],
    correct: 1,
  },
  {
    id: 2,
    text: 'Qual é o objetivo do xadrez?',
    options: ['Capturar todas as peças', 'Dar xeque-mate no rei adversário', 'Fazer mais pontos', 'Defender o tabuleiro'],
    correct: 1,
  },
  {
    id: 3,
    text: 'Quem foi derrotado por um supercomputador em 1997?',
    options: ['Carlsen', 'Kasparov', 'Fischer', 'Karpov'],
    correct: 1,
  },
  {
    id: 4,
    text: 'Qual empresa criou o computador que venceu Kasparov?',
    options: ['Google', 'Microsoft', 'IBM', 'Apple'],
    correct: 2,
  },
  {
    id: 5,
    text: 'O número de jogadas possíveis no xadrez é:',
    options: ['Pequeno', 'Limitado', 'Extremamente grande (10¹²⁰)', 'Infinito'],
    correct: 2,
  },
  {
    id: 6,
    text: 'Qual jogador possui o maior rating FIDE da história?',
    options: ['Garry Kasparov', 'Magnus Carlsen', 'Bobby Fischer', 'Anatoly Karpov'],
    correct: 1,
  },
  {
    id: 7,
    text: 'O rei pode se mover:',
    options: ['Quantas casas quiser', 'Apenas uma casa por vez', 'Apenas diagonal', 'Apenas para frente'],
    correct: 1,
  },
  {
    id: 8,
    text: 'O cavalo se move em:',
    options: ['Linha reta', 'Diagonal', '“L”', 'Zig-zag'],
    correct: 2,
  },
  {
    id: 9,
    text: 'O xadrez ajuda a desenvolver:',
    options: ['Força física', 'Reflexo apenas', 'Raciocínio lógico', 'Velocidade'],
    correct: 2,
  },
  {
    id: 10,
    text: 'O termo “xeque-mate” significa:',
    options: ['Empate', 'Rei capturado', 'Rei sem saída', 'Vitória por pontos'],
    correct: 2,
  },
];

const BLACKHOLE_QUESTIONS: Question[] = [
  {
    id: 1,
    text: 'O que é um buraco negro?',
    options: ['Um planeta', 'Uma região com gravidade extrema', 'Uma estrela comum', 'Um cometa'],
    correct: 1,
  },
  {
    id: 2,
    text: 'O que não pode escapar de um buraco negro?',
    options: ['Apenas matéria', 'Apenas gás', 'Nem mesmo a luz', 'Apenas energia'],
    correct: 2,
  },
  {
    id: 3,
    text: 'Como muitos buracos negros se formam?',
    options: ['Explosões pequenas', 'Colapso de estrelas gigantes', 'Formação de planetas', 'Gases leves'],
    correct: 1,
  },
  {
    id: 4,
    text: 'O que é o horizonte de eventos?',
    options: ['Região iluminada', 'Ponto sem retorno', 'Centro da galáxia', 'Área fria'],
    correct: 1,
  },
  {
    id: 5,
    text: 'Quem previu os buracos negros teoricamente?',
    options: ['Newton', 'Einstein', 'Tesla', 'Hawking'],
    correct: 1,
  },
  {
    id: 6,
    text: 'A primeira imagem de um buraco negro foi divulgada em:',
    options: ['2000', '2010', '2019', '2022'],
    correct: 2,
  },
  {
    id: 7,
    text: 'O tempo perto de um buraco negro:',
    options: ['Acelera', 'Para', 'Pode passar mais devagar', 'Some'],
    correct: 2,
  },
  {
    id: 8,
    text: 'O que acontece ao cruzar o horizonte de eventos?',
    options: ['Retorna', 'Fica parado', 'Não há retorno possível', 'Vira luz'],
    correct: 2,
  },
  {
    id: 9,
    text: 'Buracos negros são invisíveis porque:',
    options: ['São transparentes', 'Não refletem luz', 'Nem a luz escapa deles', 'São pequenos'],
    correct: 2,
  },
  {
    id: 10,
    text: 'Onde geralmente encontramos buracos negros?',
    options: ['Apenas na Terra', 'No espaço profundo', 'Apenas no Sol', 'No oceano'],
    correct: 1,
  },
];

const SUN_QUESTIONS: Question[] = [
  {
    id: 1,
    text: 'O Sol é:',
    options: ['Um planeta', 'Uma estrela', 'Um cometa', 'Um satélite'],
    correct: 1,
  },
  {
    id: 2,
    text: 'O Sol está localizado:',
    options: ['Na borda do sistema', 'No centro do Sistema Solar', 'Fora da galáxia', 'Na Terra'],
    correct: 1,
  },
  {
    id: 3,
    text: 'A temperatura da superfície do Sol é aproximadamente:',
    options: ['1.000°C', '5.500°C', '100°C', '50.000°C'],
    correct: 1,
  },
  {
    id: 4,
    text: 'O núcleo do Sol atinge cerca de:',
    options: ['1 milhão °C', '5 milhões °C', '15 milhões °C', '100 milhões °C'],
    correct: 2,
  },
  {
    id: 5,
    text: 'O Sol produz energia através de:',
    options: ['Combustão', 'Fusão nuclear', 'Eletricidade', 'Gravidade'],
    correct: 1,
  },
  {
    id: 6,
    text: 'A luz do Sol demora quanto tempo para chegar à Terra?',
    options: ['1 minuto', '8 minutos', '1 hora', '1 segundo'],
    correct: 1,
  },
  {
    id: 7,
    text: 'O Sol é importante porque:',
    options: ['Gera vento', 'Sustenta a vida na Terra', 'Cria oceanos', 'Forma montanhas'],
    correct: 1,
  },
  {
    id: 8,
    text: 'A idade aproximada do Sol é:',
    options: ['1 bilhão', '2 bilhões', '4,6 bilhões', '10 bilhões'],
    correct: 2,
  },
  {
    id: 9,
    text: 'O Sol transforma hidrogênio em:',
    options: ['Oxigênio', 'Carbono', 'Hélio', 'Nitrogênio'],
    correct: 2,
  },
  {
    id: 10,
    text: 'Sem o Sol, a Terra seria:',
    options: ['Mais quente', 'Igual', 'Fria e sem vida', 'Mais luminosa'],
    correct: 2,
  },
];

const SATURN_QUESTIONS: Question[] = [
  {
    id: 1,
    text: 'Saturno é o:',
    options: ['3º planeta', '5º planeta', '6º planeta', '8º planeta'],
    correct: 2,
  },
  {
    id: 2,
    text: 'Saturno é conhecido principalmente por:',
    options: ['Seus oceanos', 'Seus anéis', 'Sua lava', 'Seu gelo sólido'],
    correct: 1,
  },
  {
    id: 3,
    text: 'Os anéis de Saturno são feitos de:',
    options: ['Fogo', 'Gás', 'Gelo, rochas e poeira', 'Metal'],
    correct: 2,
  },
  {
    id: 4,
    text: 'Saturno é um planeta:',
    options: ['Rochoso', 'Gasoso', 'Líquido', 'Metálico'],
    correct: 1,
  },
  {
    id: 5,
    text: 'A temperatura média de Saturno é:',
    options: ['0°C', '100°C', '-140°C', '-10°C'],
    correct: 2,
  },
  {
    id: 6,
    text: 'Um dia em Saturno dura aproximadamente:',
    options: ['24h', '10h', '50h', '100h'],
    correct: 1,
  },
  {
    id: 7,
    text: 'Um ano em Saturno equivale a:',
    options: ['1 ano terrestre', '10 anos', '29 anos terrestres', '100 anos'],
    correct: 2,
  },
  {
    id: 8,
    text: 'Saturno é composto principalmente por:',
    options: ['Ferro', 'Água', 'Hidrogênio e hélio', 'Carbono'],
    correct: 2,
  },
  {
    id: 9,
    text: 'Saturno poderia flutuar porque:',
    options: ['É leve', 'Tem baixa densidade', 'É pequeno', 'É sólido'],
    correct: 1,
  },
  {
    id: 10,
    text: 'Saturno pertence ao:',
    options: ['Sistema Lunar', 'Sistema Solar', 'Sistema Galáctico', 'Sistema Estelar externo'],
    correct: 1,
  },
];

const ROBOT_QUESTIONS: Question[] = [
  {
    id: 1,
    text: 'O que é um robô?',
    options: ['Um ser vivo', 'Uma máquina programada', 'Um planeta', 'Um vírus'],
    correct: 1,
  },
  {
    id: 2,
    text: 'Inteligência artificial permite que máquinas:',
    options: ['Apenas liguem', 'Aprendam com dados', 'Respirem', 'Cresçam'],
    correct: 1,
  },
  {
    id: 3,
    text: 'A IA é usada em:',
    options: ['Apenas jogos', 'Reconhecimento de voz e imagem', 'Apenas carros', 'Apenas fábricas'],
    correct: 1,
  },
  {
    id: 4,
    text: 'Robôs são usados em:',
    options: ['Agricultura', 'Indústria', 'Tecnologia', 'Todas as opções'],
    correct: 3,
  },
  {
    id: 5,
    text: 'Um exemplo de IA moderna é:',
    options: ['Calculadora', 'ChatGPT', 'Lâmpada', 'Rádio'],
    correct: 1,
  },
  {
    id: 6,
    text: 'Carros autônomos usam:',
    options: ['Vapor', 'IA e sensores', 'Apenas combustível', 'Apenas GPS'],
    correct: 1,
  },
  {
    id: 7,
    text: 'IA pode ajudar em:',
    options: ['Medicina', 'Educação', 'Indústria', 'Todas as opções'],
    correct: 3,
  },
  {
    id: 8,
    text: 'Um desafio da IA é:',
    options: ['Falta de energia', 'Questões éticas', 'Falta de computadores', 'Falta de luz'],
    correct: 1,
  },
  {
    id: 9,
    text: 'Robôs podem ser:',
    options: ['Apenas físicos', 'Apenas digitais', 'Físicos e virtuais', 'Invisíveis'],
    correct: 2,
  },
  {
    id: 10,
    text: 'O futuro da IA tende a ser:',
    options: ['Parado', 'Sem evolução', 'Mais avançado e integrado', 'Extinto'],
    correct: 2,
  },
];

const SOCIAL_QUESTIONS: Question[] = [
  {
    id: 1,
    text: 'O que são redes sociais?',
    options: ['Jogos', 'Plataformas de comunicação digital', 'Sistemas operacionais', 'Bancos'],
    correct: 1,
  },
  {
    id: 2,
    text: 'Redes sociais conectam:',
    options: ['Apenas empresas', 'Apenas países', 'Pessoas no mundo todo', 'Apenas computadores'],
    correct: 2,
  },
  {
    id: 3,
    text: 'Qual dessas é uma rede social?',
    options: ['Excel', 'Instagram', 'Word', 'Paint'],
    correct: 1,
  },
  {
    id: 4,
    text: 'A empresa Meta é responsável por:',
    options: ['Google', 'Facebook e Instagram', 'Windows', 'Linux'],
    correct: 1,
  },
  {
    id: 5,
    text: 'O X é conhecido por:',
    options: ['Vídeos longos', 'Mensagens curtas', 'Jogos', 'Música'],
    correct: 1,
  },
  {
    id: 6,
    text: 'Conteúdos podem viralizar porque:',
    options: ['São apagados', 'Se espalham rapidamente', 'São escondidos', 'São pagos'],
    correct: 1,
  },
  {
    id: 7,
    text: 'Redes sociais influenciam:',
    options: ['Apenas jogos', 'Cultura e opinião', 'Apenas clima', 'Apenas esportes'],
    correct: 1,
  },
  {
    id: 8,
    text: 'Um risco das redes sociais é:',
    options: ['Energia baixa', 'Uso excessivo', 'Falta de internet', 'Falta de cor'],
    correct: 1,
  },
  {
    id: 9,
    text: 'TikTok é conhecido por:',
    options: ['Textos longos', 'Vídeos curtos', 'Emails', 'Planilhas'],
    correct: 1,
  },
  {
    id: 10,
    text: 'A principal função das redes sociais é:',
    options: ['Vender produtos', 'Conectar pessoas e compartilhar conteúdo', 'Criar jogos', 'Substituir computadores'],
    correct: 1,
  },
];

const QuizRobot = ({ theme }: { theme: 'moon' | 'earth' | 'alien' | 'chess' | 'blackhole' | 'sun' | 'saturn' | 'robot' | 'musk' }) => {
  const isEarth = theme === 'earth';
  const isAlien = theme === 'alien';
  const isChess = theme === 'chess';
  const isBlackHole = theme === 'blackhole';
  const isSun = theme === 'sun';
  const isSaturn = theme === 'saturn';
  const isAndroid = theme === 'robot';
  const isXSocialMedia = theme === 'musk';
  
  const primaryColor = isXSocialMedia ? 'bg-blue-500' : isAndroid ? 'bg-cyan-400' : isSaturn ? 'bg-amber-200' : isSun ? 'bg-orange-500' : isBlackHole ? 'bg-violet-500' : isChess ? 'bg-amber-400' : isAlien ? 'bg-lime-500' : isEarth ? 'bg-emerald-500' : 'bg-blue-500';
  const borderColor = isXSocialMedia ? 'border-blue-400' : isAndroid ? 'border-cyan-300' : isSaturn ? 'border-amber-300' : isSun ? 'border-orange-400' : isBlackHole ? 'border-violet-400' : isChess ? 'border-amber-300' : isAlien ? 'border-lime-400' : isEarth ? 'border-emerald-400' : 'border-blue-400';
  const shadowColor = isXSocialMedia ? 'rgba(59,130,246,0.3)' : isAndroid ? 'rgba(34,211,238,0.3)' : isSaturn ? 'rgba(252,211,77,0.3)' : isSun ? 'rgba(249,115,22,0.3)' : isBlackHole ? 'rgba(139,92,246,0.3)' : isChess ? 'rgba(251,191,36,0.3)' : isAlien ? 'rgba(132,204,22,0.3)' : isEarth ? 'rgba(16,185,129,0.3)' : 'rgba(96,165,250,0.3)';
  const eyeShadow = isXSocialMedia ? 'rgba(59,130,246,1)' : isAndroid ? 'rgba(34,211,238,1)' : isSaturn ? 'rgba(252,211,77,1)' : isSun ? 'rgba(249,115,22,1)' : isBlackHole ? 'rgba(139,92,246,1)' : isChess ? 'rgba(251,191,36,1)' : isAlien ? 'rgba(132,204,22,1)' : isEarth ? 'rgba(16,185,129,1)' : 'rgba(59,130,246,1)';

  return (
    <motion.div
      animate={{ 
        y: [0, -10, 0],
        rotate: isAlien ? [0, 1, -1, 0] : 0,
        scale: (isSun || isAndroid || isXSocialMedia) ? [1, 1.02, 1] : 1
      }}
      transition={{ 
        y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
        rotate: { duration: 0.2, repeat: Infinity, repeatType: "reverse" },
        scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
      }}
      className="relative w-24 h-24 flex items-center justify-center"
    >
      {/* Robot Body */}
      <div className={`w-16 h-16 bg-slate-200 rounded-2xl border-2 ${borderColor} shadow-[0_0_20px_${shadowColor}] relative flex flex-col items-center justify-center gap-2`}>
        {/* Eyes */}
        <div className="flex gap-3">
          <motion.div 
            animate={{ 
              scaleY: [1, 0.1, 1],
              opacity: (isBlackHole || isSun || isSaturn || isAndroid || isXSocialMedia) ? [1, 0.5, 1] : 1
            }}
            transition={{ duration: 4, repeat: Infinity, times: [0, 0.1, 0.2] }}
            className={`w-3 h-3 ${primaryColor} rounded-full shadow-[0_0_8px_${eyeShadow}]`} 
          />
          <motion.div 
            animate={{ 
              scaleY: [1, 0.1, 1],
              opacity: (isBlackHole || isSun || isSaturn || isAndroid || isXSocialMedia) ? [1, 0.5, 1] : 1
            }}
            transition={{ duration: 4, repeat: Infinity, times: [0, 0.1, 0.2] }}
            className={`w-3 h-3 ${primaryColor} rounded-full shadow-[0_0_8px_${eyeShadow}]`} 
          />
        </div>
        {/* Mouth/Signal */}
        <div className={`w-8 h-1 ${isXSocialMedia ? 'bg-blue-400/30' : isAndroid ? 'bg-cyan-400/30' : isSaturn ? 'bg-amber-300/30' : isSun ? 'bg-orange-400/30' : isBlackHole ? 'bg-violet-400/30' : isAlien ? 'bg-lime-400/30' : isEarth ? 'bg-emerald-400/30' : 'bg-blue-400/30'} rounded-full overflow-hidden`}>
          <motion.div 
            animate={{ x: [-10, 10, -10] }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className={`w-4 h-full ${isXSocialMedia ? 'bg-blue-400' : isAndroid ? 'bg-cyan-400' : isSaturn ? 'bg-amber-300' : isSun ? 'bg-orange-400' : isBlackHole ? 'bg-violet-400' : isAlien ? 'bg-lime-400' : isEarth ? 'bg-emerald-400' : 'bg-blue-400'}`} 
          />
        </div>
        {/* Antenna */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-slate-400">
          <div className={`absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 ${isXSocialMedia ? 'bg-blue-400' : isAndroid ? 'bg-cyan-400' : isSaturn ? 'bg-amber-300' : isSun ? 'bg-orange-400' : isBlackHole ? 'bg-violet-400' : isAlien ? 'bg-lime-400' : isEarth ? 'bg-emerald-400' : 'bg-blue-400'} rounded-full animate-pulse`} />
        </div>
      </div>
      {/* Floating Base Glow */}
      <div className={`absolute -bottom-4 w-12 h-2 ${isXSocialMedia ? 'bg-blue-500/20' : isAndroid ? 'bg-cyan-400/20' : isSaturn ? 'bg-amber-200/20' : isSun ? 'bg-orange-500/20' : isBlackHole ? 'bg-violet-500/20' : isAlien ? 'bg-lime-500/20' : isEarth ? 'bg-emerald-500/20' : 'bg-blue-500/20'} blur-md rounded-full`} />
    </motion.div>
  );
};

export const ThemeInfoWindow = ({ isOpen, onClose, themeId, language }: ThemeInfoWindowProps) => {
  const [view, setView] = useState<'info' | 'quiz' | 'result'>('info');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setView('info');
        setCurrentQuestion(0);
        setScore(0);
        setSelectedOption(null);
        setIsCorrect(null);
      }, 300);
    }
  }, [isOpen]);

  const isEarth = themeId === 'earth';
  const isAlien = themeId === 'neila';
  const isChess = themeId === 'chess';
  const isBlackHole = themeId === 'blackhole';
  const isSun = themeId === 'sun';
  const isSaturn = themeId === 'saturn';
  const isAndroid = themeId === 'robot';
  const isXSocialMedia = themeId === 'musk';
  const questions = isXSocialMedia ? SOCIAL_QUESTIONS : isAndroid ? ROBOT_QUESTIONS : isSaturn ? SATURN_QUESTIONS : isSun ? SUN_QUESTIONS : isBlackHole ? BLACKHOLE_QUESTIONS : isChess ? CHESS_QUESTIONS : isAlien ? ALIEN_QUESTIONS : isEarth ? EARTH_QUESTIONS : MOON_QUESTIONS;

  const handleAnswer = (index: number) => {
    if (selectedOption !== null) return;
    
    setSelectedOption(index);
    const correct = index === questions[currentQuestion].correct;
    setIsCorrect(correct);
    if (correct) setScore(prev => prev + 1);

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedOption(null);
        setIsCorrect(null);
      } else {
        setView('result');
      }
    }, 1500);
  };

  const getMotivationalPhrase = () => {
    if (score <= 3) {
      if (isXSocialMedia) return "A conexão começa com o primeiro clique.";
      if (isAndroid) return "Todo sistema começa com aprendizado básico.";
      if (isSaturn) return "O universo ainda guarda muitos segredos para você.";
      if (isSun) return "Até a menor chama pode crescer.";
      if (isBlackHole) return "Até a luz se perde… mas você pode evoluir.";
      if (isChess) return "Toda estratégia começa com aprendizado.";
      if (isAlien) return "O desconhecido é o primeiro passo para a descoberta…";
      return isEarth ? "A Terra é cheia de descobertas. Continue explorando!" : "Todo aprendizado começa do zero. Continue explorando!";
    }
    if (score <= 6) {
      if (isXSocialMedia) return "Você já entende parte do mundo digital.";
      if (isAndroid) return "Você já entende parte da inteligência artificial.";
      if (isSaturn) return "Você já entende parte da grandiosidade do cosmos.";
      if (isSun) return "Você já entende parte da energia do universo.";
      if (isBlackHole) return "Você resistiu parcialmente à gravidade do desconhecido.";
      if (isChess) return "Você já pensa como um estrategista.";
      if (isAlien) return "Você já começou a entender os mistérios do universo…";
      return isEarth ? "Bom conhecimento! Você já entende bastante do nosso planeta." : "Bom progresso! Você já entende bastante sobre a Lua.";
    }
    if (score <= 9) {
      if (isXSocialMedia) return "Excelente! Você está bem conectado.";
      if (isAndroid) return "Excelente! Sua lógica está evoluindo.";
      if (isSaturn) return "Excelente! Seu conhecimento está em órbita elevada.";
      if (isSun) return "Excelente! Seu conhecimento brilha intensamente.";
      if (isBlackHole) return "Excelente! Sua mente não foi sugada pelo desconhecido.";
      if (isChess) return "Excelente domínio tático.";
      if (isAlien) return "Excelente! Sua mente está aberta ao desconhecido.";
      return isEarth ? "Excelente! Você tem grande consciência sobre a Terra." : "Excelente! Seu conhecimento está quase completo.";
    }
    if (isXSocialMedia) return "Perfeito. Você domina o universo das redes sociais.";
    if (isAndroid) return "Perfeito. Sua mente opera em nível avançado.";
    if (isSaturn) return "Perfeito. Você domina o conhecimento sobre Saturno.";
    if (isSun) return "Impressionante. Sua mente é tão poderosa quanto uma estrela.";
    if (isBlackHole) return "Impressionante. Você domina até os mistérios mais extremos do universo.";
    if (isChess) return "Grão-Mestre. Sua mente é de elite.";
    if (isAlien) return "Impressionante. Você domina o conhecimento sobre o tema alienígena.";
    return isEarth ? "Perfeito! Você domina o conhecimento sobre o nosso planeta." : "Perfeito! Você domina o conhecimento sobre a Lua.";
  };

  if (themeId !== 'moon' && themeId !== 'earth' && themeId !== 'neila' && themeId !== 'chess' && themeId !== 'blackhole' && themeId !== 'sun' && themeId !== 'saturn' && themeId !== 'robot' && themeId !== 'musk') return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 50, opacity: 0 }}
            className={`w-full max-w-3xl max-h-[90vh] bg-slate-950/80 border border-white/10 rounded-3xl overflow-hidden flex flex-col relative shadow-[0_0_100px_rgba(255,255,255,0.05)] ${isAndroid ? 'shadow-cyan-500/10' : isSaturn ? 'shadow-amber-200/10' : isSun ? 'shadow-orange-500/10' : isBlackHole ? 'shadow-violet-500/10' : isChess ? 'shadow-amber-500/10' : isAlien ? 'shadow-lime-500/10' : isEarth ? 'shadow-emerald-500/5' : 'shadow-blue-500/5'}`}
          >
            {/* Grid Background for Android and X Theme */}
            {isAndroid && (
              <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d4_1px,transparent_1px),linear-gradient(to_bottom,#06b6d4_1px,transparent_1px)] bg-[size:40px_40px]" />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-transparent to-slate-950" />
              </div>
            )}
            {isXSocialMedia && (
              <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f6_1px,transparent_1px),linear-gradient(to_bottom,#a855f7_1px,transparent_1px)] bg-[size:60px_60px]" />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-transparent to-slate-950" />
              </div>
            )}

            {/* HUD Elements for Android and X Theme */}
            {(isAndroid || isXSocialMedia) && (
              <>
                <div className={`absolute top-4 left-4 w-12 h-12 border-t border-l ${isXSocialMedia ? 'border-blue-500/40' : 'border-cyan-500/40'} rounded-tl-lg pointer-events-none`} />
                <div className={`absolute top-4 right-4 w-12 h-12 border-t border-r ${isXSocialMedia ? 'border-blue-500/40' : 'border-cyan-500/40'} rounded-tr-lg pointer-events-none`} />
                <div className={`absolute bottom-4 left-4 w-12 h-12 border-b border-l ${isXSocialMedia ? 'border-blue-500/40' : 'border-cyan-500/40'} rounded-bl-lg pointer-events-none`} />
                <div className={`absolute bottom-4 right-4 w-12 h-12 border-b border-r ${isXSocialMedia ? 'border-blue-500/40' : 'border-cyan-500/40'} rounded-br-lg pointer-events-none`} />
                
                <div className="absolute top-1/2 left-2 -translate-y-1/2 flex flex-col gap-2 opacity-30">
                  {[1,2,3].map(i => <div key={i} className={`w-1 h-4 ${isXSocialMedia ? 'bg-blue-500' : 'bg-cyan-500'} rounded-full`} />)}
                </div>
                <div className="absolute top-1/2 right-2 -translate-y-1/2 flex flex-col gap-2 opacity-30">
                  {[1,2,3].map(i => <div key={i} className={`w-1 h-4 ${isXSocialMedia ? 'bg-blue-500' : 'bg-cyan-500'} rounded-full`} />)}
                </div>
              </>
            )}

            {/* Header */}
            <div className={`p-8 border-b border-white/5 flex justify-between items-center bg-gradient-to-r ${isXSocialMedia ? 'from-blue-500/10' : isAndroid ? 'from-cyan-500/10' : isSaturn ? 'from-amber-200/10' : isSun ? 'from-orange-500/10' : isBlackHole ? 'from-violet-500/10' : isChess ? 'from-amber-500/10' : isAlien ? 'from-lime-500/10' : isEarth ? 'from-emerald-500/10' : 'from-blue-500/10'} to-transparent`}>
              <div>
                <motion.h2 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="text-3xl font-orbitron font-bold text-white tracking-widest flex items-center gap-3"
                >
                  {isXSocialMedia ? 'X ❌ / REDES SOCIAIS' : isAndroid ? 'ROBÔ ANDROID 🤖' : isSaturn ? 'SATURNO 🪐' : isSun ? 'SOL ☀️' : isBlackHole ? 'BURACO NEGRO 🕳️' : isChess ? 'GRÃO-MESTRE ♟️' : isAlien ? 'ALIEN 👽' : isEarth ? 'TERRA 🌍' : 'LUA 🌕'}
                </motion.h2>
                <p className="text-slate-400 font-orbitron text-xs tracking-[0.3em] uppercase mt-1">
                  {isXSocialMedia ? 'Conectando o mundo digital' : isAndroid ? 'Inteligência artificial em evolução' : isSaturn ? 'O gigante dos anéis' : isSun ? 'A estrela que sustenta a vida' : isBlackHole ? 'Onde a gravidade domina tudo' : isChess ? 'O ápice da estratégia' : isAlien ? 'Estamos sozinhos no universo?' : isEarth ? 'Nosso planeta vivo' : 'Nosso satélite natural'}
                </p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <AnimatePresence mode="wait">
                {view === 'info' && (
                  <motion.div
                    key="info"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-12"
                  >
                    {/* Info Blocks */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {isXSocialMedia ? (
                        <>
                          <div className="p-6 bg-white/5 border border-white/5 rounded-2xl hover:border-blue-500/30 transition-colors group">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400 group-hover:scale-110 transition-transform">
                                <Info className="w-5 h-5" />
                              </div>
                              <h3 className="font-orbitron text-sm text-white tracking-widest uppercase">O que são</h3>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed">
                              Plataformas digitais que permitem a criação e compartilhamento de conteúdo, conectando pessoas globalmente em tempo real.
                            </p>
                          </div>

                          <div className="p-6 bg-white/5 border border-white/5 rounded-2xl hover:border-purple-500/30 transition-colors group">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400 group-hover:scale-110 transition-transform">
                                <BrainCircuit className="w-5 h-5" />
                              </div>
                              <h3 className="font-orbitron text-sm text-white tracking-widest uppercase">Impacto</h3>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed">
                              Influenciam a cultura, a política e a forma como consumimos notícias. A informação viaja na velocidade da luz.
                            </p>
                          </div>

                          <div className="p-6 bg-white/5 border border-white/5 rounded-2xl hover:border-cyan-500/30 transition-colors group">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400 group-hover:scale-110 transition-transform">
                                <Award className="w-5 h-5" />
                              </div>
                              <h3 className="font-orbitron text-sm text-white tracking-widest uppercase">Plataformas</h3>
                            </div>
                            <ul className="text-slate-400 text-sm space-y-2 leading-relaxed">
                              <li>• Meta (Facebook, Instagram, WhatsApp)</li>
                              <li>• X (Antigo Twitter) - Microblogging</li>
                              <li>• TikTok - Vídeos curtos e virais</li>
                            </ul>
                          </div>

                          <div className="p-6 bg-white/5 border border-white/5 rounded-2xl hover:border-indigo-500/30 transition-colors group">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400 group-hover:scale-110 transition-transform">
                                <RotateCcw className="w-5 h-5" />
                              </div>
                              <h3 className="font-orbitron text-sm text-white tracking-widest uppercase">Conexão</h3>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed">
                              Permitem que qualquer pessoa seja um criador de conteúdo, democratizando o acesso à voz global.
                            </p>
                          </div>
                        </>
                      ) : isAndroid ? (
                        <>
                          <div className="p-6 bg-white/5 border border-white/5 rounded-2xl hover:border-cyan-500/30 transition-colors group">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400 group-hover:scale-110 transition-transform">
                                <Info className="w-5 h-5" />
                              </div>
                              <h3 className="font-orbitron text-sm text-white tracking-widest uppercase">O que são</h3>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed">
                              Máquinas programadas para executar tarefas de forma autônoma ou semi-autônoma. Podem ser físicos ou virtuais.
                            </p>
                          </div>

                          <div className="p-6 bg-white/5 border border-white/5 rounded-2xl hover:border-blue-500/30 transition-colors group">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400 group-hover:scale-110 transition-transform">
                                <BrainCircuit className="w-5 h-5" />
                              </div>
                              <h3 className="font-orbitron text-sm text-white tracking-widest uppercase">IA</h3>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed">
                              Permite que máquinas &quot;aprendam&quot; com dados. Usada em reconhecimento de voz, imagens e decisões complexas.
                            </p>
                          </div>

                          <div className="p-6 bg-white/5 border border-white/5 rounded-2xl hover:border-indigo-500/30 transition-colors group">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400 group-hover:scale-110 transition-transform">
                                <Award className="w-5 h-5" />
                              </div>
                              <h3 className="font-orbitron text-sm text-white tracking-widest uppercase">Uso Real</h3>
                            </div>
                            <ul className="text-slate-400 text-sm space-y-2 leading-relaxed">
                              <li>• Indústrias automatizadas</li>
                              <li>• Carros autônomos</li>
                              <li>• Assistentes virtuais (ChatGPT)</li>
                            </ul>
                          </div>

                          <div className="p-6 bg-white/5 border border-white/5 rounded-2xl hover:border-purple-500/30 transition-colors group">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400 group-hover:scale-110 transition-transform">
                                <RotateCcw className="w-5 h-5" />
                              </div>
                              <h3 className="font-orbitron text-sm text-white tracking-widest uppercase">Futuro</h3>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed">
                              Robôs mais inteligentes e autônomos, com maior convivência humana e debates sobre limites éticos.
                            </p>
                          </div>
                        </>
                      ) : isSaturn ? (
                        <>
                          <div className="p-6 bg-white/5 border border-white/5 rounded-2xl hover:border-amber-200/30 transition-colors group">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-amber-200/20 rounded-lg text-amber-100 group-hover:scale-110 transition-transform">
                                <Info className="w-5 h-5" />
                              </div>
                              <h3 className="font-orbitron text-sm text-white tracking-widest uppercase">Sobre Saturno</h3>
                            </div>
                            <ul className="text-slate-400 text-sm space-y-2 leading-relaxed">
                              <li>• Sexto planeta a partir do Sol</li>
                              <li>• Um dos maiores do Sistema Solar</li>
                              <li>• Conhecido por seus anéis impressionantes</li>
                            </ul>
                          </div>

                          <div className="p-6 bg-white/5 border border-white/5 rounded-2xl hover:border-amber-300/30 transition-colors group">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-amber-300/20 rounded-lg text-amber-200 group-hover:scale-110 transition-transform">
                                <RotateCcw className="w-5 h-5" />
                              </div>
                              <h3 className="font-orbitron text-sm text-white tracking-widest uppercase">Anéis</h3>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed">
                              Formados por gelo, rochas e poeira. Podem ter milhares de km de largura, mas são extremamente finos.
                            </p>
                          </div>

                          <div className="p-6 bg-white/5 border border-white/5 rounded-2xl hover:border-amber-400/30 transition-colors group">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-amber-400/20 rounded-lg text-amber-300 group-hover:scale-110 transition-transform">
                                <Award className="w-5 h-5" />
                              </div>
                              <h3 className="font-orbitron text-sm text-white tracking-widest uppercase">Composição</h3>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed">
                              Planeta gasoso composto principalmente por hidrogênio e hélio. Temperatura média de -140°C.
                            </p>
                          </div>

                          <div className="p-6 bg-white/5 border border-white/5 rounded-2xl hover:border-amber-500/30 transition-colors group">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400 group-hover:scale-110 transition-transform">
                                <BrainCircuit className="w-5 h-5" />
                              </div>
                              <h3 className="font-orbitron text-sm text-white tracking-widest uppercase">Tempo</h3>
                            </div>
                            <ul className="text-slate-400 text-sm space-y-2 leading-relaxed">
                              <li>• Dia: ~10 horas</li>
                              <li>• Ano: ~29 anos terrestres</li>
                            </ul>
                          </div>
                        </>
                      ) : isSun ? (
                        <>
                          <div className="p-6 bg-white/5 border border-white/5 rounded-2xl hover:border-orange-500/30 transition-colors group">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-orange-500/20 rounded-lg text-orange-400 group-hover:scale-110 transition-transform">
                                <Info className="w-5 h-5" />
                              </div>
                              <h3 className="font-orbitron text-sm text-white tracking-widest uppercase">O que é</h3>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed">
                              O Sol é uma estrela no centro do Sistema Solar, responsável pela energia que sustenta a vida na Terra.
                            </p>
                          </div>

                          <div className="p-6 bg-white/5 border border-white/5 rounded-2xl hover:border-red-500/30 transition-colors group">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-red-500/20 rounded-lg text-red-400 group-hover:scale-110 transition-transform">
                                <RotateCcw className="w-5 h-5" />
                              </div>
                              <h3 className="font-orbitron text-sm text-white tracking-widest uppercase">Temperatura</h3>
                            </div>
                            <ul className="text-slate-400 text-sm space-y-2 leading-relaxed">
                              <li>• Superfície: ~5.500°C</li>
                              <li>• Núcleo: +15 milhões de °C</li>
                            </ul>
                          </div>

                          <div className="p-6 bg-white/5 border border-white/5 rounded-2xl hover:border-yellow-500/30 transition-colors group">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-400 group-hover:scale-110 transition-transform">
                                <Award className="w-5 h-5" />
                              </div>
                              <h3 className="font-orbitron text-sm text-white tracking-widest uppercase">Energia</h3>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed">
                              Produz energia por fusão nuclear, convertendo hidrogênio em hélio em seu núcleo.
                            </p>
                          </div>

                          <div className="p-6 bg-white/5 border border-white/5 rounded-2xl hover:border-orange-400/30 transition-colors group">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-orange-400/20 rounded-lg text-orange-300 group-hover:scale-110 transition-transform">
                                <BrainCircuit className="w-5 h-5" />
                              </div>
                              <h3 className="font-orbitron text-sm text-white tracking-widest uppercase">Importância</h3>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed">
                              Permite a existência de vida, controla o clima e os ciclos naturais do nosso planeta.
                            </p>
                          </div>
                        </>
                      ) : isBlackHole ? (
                        <>
                          <div className="p-6 bg-white/5 border border-white/5 rounded-2xl hover:border-violet-500/30 transition-colors group">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-violet-500/20 rounded-lg text-violet-400 group-hover:scale-110 transition-transform">
                                <Info className="w-5 h-5" />
                              </div>
                              <h3 className="font-orbitron text-sm text-white tracking-widest uppercase">O que é</h3>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed">
                              Uma região do espaço com gravidade tão forte que nada, nem mesmo a luz, pode escapar.
                            </p>
                          </div>

                          <div className="p-6 bg-white/5 border border-white/5 rounded-2xl hover:border-indigo-500/30 transition-colors group">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400 group-hover:scale-110 transition-transform">
                                <RotateCcw className="w-5 h-5" />
                              </div>
                              <h3 className="font-orbitron text-sm text-white tracking-widest uppercase">Gravidade</h3>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed">
                              Formados pelo colapso de estrelas gigantes. Sua força de atração é gigantesca e distorce o espaço-tempo.
                            </p>
                          </div>

                          <div className="p-6 bg-white/5 border border-white/5 rounded-2xl hover:border-cyan-500/30 transition-colors group">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400 group-hover:scale-110 transition-transform">
                                <Award className="w-5 h-5" />
                              </div>
                              <h3 className="font-orbitron text-sm text-white tracking-widest uppercase">Horizonte</h3>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed">
                              O &quot;ponto sem retorno&quot;. Tudo que cruza o horizonte de eventos é sugado para a singularidade.
                            </p>
                          </div>

                          <div className="p-6 bg-white/5 border border-white/5 rounded-2xl hover:border-purple-500/30 transition-colors group">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400 group-hover:scale-110 transition-transform">
                                <BrainCircuit className="w-5 h-5" />
                              </div>
                              <h3 className="font-orbitron text-sm text-white tracking-widest uppercase">Teoria</h3>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed">
                              Previstos por Einstein. A primeira imagem real foi divulgada em 2019 pelo Event Horizon Telescope.
                            </p>
                          </div>
                        </>
                      ) : isChess ? (
                        <>
                          <div className="p-6 bg-white/5 border border-white/5 rounded-2xl hover:border-amber-500/30 transition-colors group">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400 group-hover:scale-110 transition-transform">
                                <Info className="w-5 h-5" />
                              </div>
                              <h3 className="font-orbitron text-sm text-white tracking-widest uppercase">Sobre o Xadrez</h3>
                            </div>
                            <ul className="text-slate-400 text-sm space-y-2 leading-relaxed">
                              <li>• Jogo milenar de estratégia</li>
                              <li>• Origem na Índia (Chaturanga)</li>
                              <li>• Considerado o &quot;Jogo dos Reis&quot;</li>
                            </ul>
                          </div>

                          <div className="p-6 bg-white/5 border border-white/5 rounded-2xl hover:border-slate-400/30 transition-colors group">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-slate-500/20 rounded-lg text-slate-300 group-hover:scale-110 transition-transform">
                                <MessageSquare className="w-5 h-5" />
                              </div>
                              <h3 className="font-orbitron text-sm text-white tracking-widest uppercase">Complexidade</h3>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed">
                              Estimativa de mais de 10¹²⁰ jogadas possíveis (Número de Shannon). Mais variações que átomos no universo observável.
                            </p>
                          </div>

                          <div className={`p-6 bg-white/5 border border-white/5 rounded-2xl hover:border-amber-400/30 transition-colors group`}>
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-amber-400/20 rounded-lg text-amber-300 group-hover:scale-110 transition-transform">
                                <Award className="w-5 h-5" />
                              </div>
                              <h3 className="font-orbitron text-sm text-white tracking-widest uppercase">Grandes Mestres</h3>
                            </div>
                            <ul className="text-slate-400 text-sm space-y-2 leading-relaxed">
                              <li>• Garry Kasparov: Domínio por décadas</li>
                              <li>• Magnus Carlsen: O gênio atual</li>
                              <li>• Bobby Fischer: Lenda americana</li>
                            </ul>
                          </div>

                          <div className="p-6 bg-white/5 border border-white/5 rounded-2xl hover:border-blue-500/30 transition-colors group">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400 group-hover:scale-110 transition-transform">
                                <BrainCircuit className="w-5 h-5" />
                              </div>
                              <h3 className="font-orbitron text-sm text-white tracking-widest uppercase">IA vs Humanos</h3>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed">
                              Em 1997, o computador Deep Blue da IBM derrotou Kasparov, marcando uma nova era na inteligência artificial.
                            </p>
                          </div>
                        </>
                      ) : isAlien ? (
                        <>
                          <div className="p-6 bg-white/5 border border-white/5 rounded-2xl hover:border-emerald-500/30 transition-colors group">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400 group-hover:scale-110 transition-transform">
                                <Info className="w-5 h-5" />
                              </div>
                              <h3 className="font-orbitron text-sm text-white tracking-widest uppercase">Sobre a Terra</h3>
                            </div>
                            <ul className="text-slate-400 text-sm space-y-2 leading-relaxed">
                              <li>• Terceiro planeta do Sistema Solar</li>
                              <li>• Idade estimada: ~4,5 bilhões de anos</li>
                              <li>• Único planeta conhecido com vida</li>
                            </ul>
                          </div>

                          <div className="p-6 bg-white/5 border border-white/5 rounded-2xl hover:border-blue-500/30 transition-colors group">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400 group-hover:scale-110 transition-transform">
                                <MessageSquare className="w-5 h-5" />
                              </div>
                              <h3 className="font-orbitron text-sm text-white tracking-widest uppercase">Água</h3>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed">
                              ~71% da superfície é coberta por água. A maior parte é salgada, formando os vastos oceanos que regulam o clima.
                            </p>
                          </div>

                          <div className="p-6 bg-white/5 border border-white/5 rounded-2xl hover:border-green-500/30 transition-colors group">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-green-500/20 rounded-lg text-green-400 group-hover:scale-110 transition-transform">
                                <RotateCcw className="w-5 h-5" />
                              </div>
                              <h3 className="font-orbitron text-sm text-white tracking-widest uppercase">Natureza</h3>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed">
                              Milhões de espécies e florestas essenciais. A Amazônia é vital para o equilíbrio climático global.
                            </p>
                          </div>

                          <div className="p-6 bg-white/5 border border-white/5 rounded-2xl hover:border-amber-500/30 transition-colors group">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400 group-hover:scale-110 transition-transform">
                                <Award className="w-5 h-5" />
                              </div>
                              <h3 className="font-orbitron text-sm text-white tracking-widest uppercase">População</h3>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed">
                              Mais de 8 bilhões de pessoas distribuídas em 6 continentes: África, América, Antártida, Ásia, Europa e Oceania.
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="p-6 bg-white/5 border border-white/5 rounded-2xl hover:border-white/10 transition-colors group">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400 group-hover:scale-110 transition-transform">
                                <Info className="w-5 h-5" />
                              </div>
                              <h3 className="font-orbitron text-sm text-white tracking-widest uppercase">Sobre a Lua</h3>
                            </div>
                            <ul className="text-slate-400 text-sm space-y-2 leading-relaxed">
                              <li>• Único satélite natural da Terra</li>
                              <li>• Distância média: ~384.400 km</li>
                              <li>• Influencia diretamente as marés</li>
                            </ul>
                          </div>

                          <div className="p-6 bg-white/5 border border-white/5 rounded-2xl hover:border-white/10 transition-colors group">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400 group-hover:scale-110 transition-transform">
                                <MessageSquare className="w-5 h-5" />
                              </div>
                              <h3 className="font-orbitron text-sm text-white tracking-widest uppercase">Marés</h3>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed">
                              A gravidade da Lua causa as marés nos oceanos. Quanto mais alinhada com o Sol, mais intensas elas se tornam.
                            </p>
                          </div>

                          <div className="p-6 bg-white/5 border border-white/5 rounded-2xl hover:border-white/10 transition-colors group">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400 group-hover:scale-110 transition-transform">
                                <RotateCcw className="w-5 h-5" />
                              </div>
                              <h3 className="font-orbitron text-sm text-white tracking-widest uppercase">Fases da Lua</h3>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed">
                              Nova, Crescente, Cheia e Minguante. O ciclo completo dura aproximadamente 29,5 dias.
                            </p>
                          </div>

                          <div className="p-6 bg-white/5 border border-white/5 rounded-2xl hover:border-white/10 transition-colors group">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400 group-hover:scale-110 transition-transform">
                                <Award className="w-5 h-5" />
                              </div>
                              <h3 className="font-orbitron text-sm text-white tracking-widest uppercase">Exploração</h3>
                            </div>
                            <ul className="text-slate-400 text-sm space-y-2 leading-relaxed">
                              <li>• Primeiro pouso: 1969</li>
                              <li>• Missão: Apollo 11</li>
                              <li>• Astronauta: Neil Armstrong</li>
                            </ul>
                          </div>
                        </>
                      )}
                    </div>

                    <div className={`p-6 ${isXSocialMedia ? 'bg-blue-500/5 border-blue-500/20' : isAndroid ? 'bg-cyan-500/5 border-cyan-500/20' : isSaturn ? 'bg-amber-200/5 border-amber-200/20' : isSun ? 'bg-orange-500/5 border-orange-500/20' : isBlackHole ? 'bg-violet-500/5 border-violet-500/20' : isChess ? 'bg-amber-500/5 border-amber-500/20' : isAlien ? 'bg-lime-500/5 border-lime-500/20' : isEarth ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-blue-500/5 border-blue-500/20'} border rounded-2xl relative overflow-hidden`}>
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                        <BrainCircuit className="w-12 h-12" />
                      </div>
                      <h3 className={`font-orbitron text-sm ${isXSocialMedia ? 'text-blue-400' : isAndroid ? 'text-cyan-400' : isSaturn ? 'text-amber-200' : isSun ? 'text-orange-400' : isBlackHole ? 'text-violet-400' : isChess ? 'text-amber-400' : isAlien ? 'text-lime-400' : isEarth ? 'text-emerald-400' : 'text-blue-400'} tracking-widest uppercase mb-2`}>Curiosidade</h3>
                      <p className="text-slate-300 text-sm italic">
                        {isXSocialMedia
                          ? "&quot;O uso excessivo de redes sociais pode impactar a saúde mental. É importante manter o equilíbrio entre o mundo digital e o real.&quot;"
                          : isAndroid
                          ? "&quot;O termo 'robô' vem da palavra tcheca 'robota', que significa 'trabalho forçado'.&quot;"
                          : isSaturn
                          ? "&quot;Saturno poderia flutuar na água devido à sua baixíssima densidade, sendo o planeta menos denso do Sistema Solar.&quot;"
                          : isSun
                          ? "&quot;A luz do Sol leva cerca de 8 minutos para percorrer os 150 milhões de quilômetros até a Terra.&quot;"
                          : isBlackHole
                          ? "&quot;O tempo pode passar mais devagar próximo a um buraco negro devido à dilatação temporal gravitacional.&quot;"
                          : isChess
                          ? "&quot;O xadrez melhora o raciocínio lógico e a tomada de decisão, sendo usado como ferramenta educacional em todo o mundo.&quot;"
                          : isAlien
                          ? "&quot;Até hoje, não há prova científica confirmada de vida alienígena, mas o mistério continua aberto.&quot;"
                          : isEarth 
                          ? "&quot;A atmosfera protege a Terra contra radiação e meteoros. Sem ela, a vida como conhecemos não existiria.&quot;"
                          : "&quot;A Lua está se afastando da Terra aproximadamente 3,8 cm por ano.&quot;"
                        }
                      </p>
                    </div>

                    <div className="flex justify-center pt-4">
                      <motion.button
                        whileHover={{ scale: 1.05, x: 5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setView('quiz')}
                        className={`flex items-center gap-3 px-8 py-4 bg-white text-black font-orbitron text-sm font-bold tracking-widest rounded-xl ${isXSocialMedia ? 'hover:bg-blue-400' : isAndroid ? 'hover:bg-cyan-400' : isSaturn ? 'hover:bg-amber-200' : isSun ? 'hover:bg-orange-400' : isBlackHole ? 'hover:bg-violet-400' : isChess ? 'hover:bg-amber-400' : isAlien ? 'hover:bg-lime-400' : isEarth ? 'hover:bg-emerald-400' : 'hover:bg-blue-400'} transition-colors group`}
                      >
                        {isXSocialMedia ? 'TESTAR CONEXÃO' : isAndroid ? 'INICIAR ANÁLISE DE IA' : isSaturn ? 'EXPLORAR CONHECIMENTO' : isSun ? 'TESTAR ENERGIA' : isBlackHole ? 'INICIAR ANÁISE GRAVITACIONAL' : isChess ? 'TESTAR ESTRATÉGIA' : isAlien ? 'INICIAR ANÁLISE' : 'INICIAR QUIZ'} <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {view === 'quiz' && (
                  <motion.div
                    key="quiz"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="flex flex-col h-full"
                  >
                    <div className="flex justify-between items-center mb-8">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 ${isXSocialMedia ? 'bg-blue-500/20 text-blue-400' : isAndroid ? 'bg-cyan-500/20 text-cyan-400' : isSaturn ? 'bg-amber-200/20 text-amber-100' : isSun ? 'bg-orange-500/20 text-orange-400' : isBlackHole ? 'bg-violet-500/20 text-violet-400' : isChess ? 'bg-amber-500/20 text-amber-400' : isAlien ? 'bg-lime-500/20 text-lime-400' : isEarth ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'} rounded-full flex items-center justify-center font-orbitron font-bold`}>
                          {currentQuestion + 1}
                        </div>
                        <div className="h-1 w-48 bg-white/10 rounded-full overflow-hidden">
                          <motion.div 
                            className={`h-full ${isXSocialMedia ? 'bg-blue-400' : isAndroid ? 'bg-cyan-400' : isSaturn ? 'bg-amber-200' : isSun ? 'bg-orange-500' : isBlackHole ? 'bg-violet-500' : isChess ? 'bg-amber-500' : isAlien ? 'bg-lime-500' : isEarth ? 'bg-emerald-500' : 'bg-blue-500'}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-slate-500 font-orbitron text-xs tracking-widest">
                        QUESTÃO {currentQuestion + 1} DE {questions.length}
                      </span>
                    </div>

                    <div className="flex-1 flex flex-col md:flex-row gap-8 items-center">
                      <div className="flex-1 space-y-8 w-full">
                        <h3 className="text-xl font-orbitron text-white leading-relaxed">
                          {questions[currentQuestion].text}
                        </h3>

                        <div className="grid grid-cols-1 gap-3">
                          {questions[currentQuestion].options.map((option, idx) => (
                            <motion.button
                              key={idx}
                              whileHover={selectedOption === null ? { x: 10, backgroundColor: 'rgba(255,255,255,0.05)' } : {}}
                              whileTap={selectedOption === null ? { scale: 0.98 } : {}}
                              onClick={() => handleAnswer(idx)}
                              className={`w-full p-5 rounded-xl border text-left font-orbitron text-sm tracking-widest transition-all duration-300 flex justify-between items-center ${
                                selectedOption === idx
                                  ? idx === questions[currentQuestion].correct
                                    ? 'bg-green-500/20 border-green-500 text-green-400'
                                    : 'bg-red-500/20 border-red-500 text-red-400'
                                  : selectedOption !== null && idx === questions[currentQuestion].correct
                                  ? 'bg-green-500/20 border-green-500 text-green-400'
                                  : 'bg-white/5 border-white/10 text-slate-300'
                              }`}
                            >
                              {option}
                              {selectedOption === idx && (
                                <span>{idx === questions[currentQuestion].correct ? '✓' : '✗'}</span>
                              )}
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      <div className="hidden md:flex flex-col items-center gap-4">
                        <div className="relative">
                          <div className="absolute -top-20 right-0 w-48 p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-xs text-white font-orbitron leading-relaxed shadow-xl">
                            <div className="absolute bottom-[-10px] right-8 w-4 h-4 bg-white/10 border-r border-b border-white/20 rotate-45" />
                            {selectedOption === null 
                              ? isXSocialMedia ? "Analisando sua conexão com o mundo digital…" : isAndroid ? "Iniciando avaliação de conhecimento tecnológico…" : isSaturn ? "Iniciando análise sobre o gigante dos anéis…" : isSun ? "Preparando teste de energia estelar…" : isBlackHole ? "Cuidado… sua mente será testada sob gravidade extrema…" : isChess ? "Vamos avaliar sua capacidade estratégica…" : isAlien ? "Analisando seu conhecimento sobre vida extraterrestre…" : isEarth ? "Vamos ver o quanto você conhece sobre o planeta Terra…" : "Vamos testar seu conhecimento sobre a Lua..."
                              : isCorrect 
                              ? "Exato! Você está indo muito bem."
                              : "Ops, essa não era a correta. Continue tentando!"
                            }
                          </div>
                          <QuizRobot theme={isXSocialMedia ? 'musk' : isAndroid ? 'robot' : isSaturn ? 'saturn' : isSun ? 'sun' : isBlackHole ? 'blackhole' : isChess ? 'chess' : isAlien ? 'alien' : isEarth ? 'earth' : 'moon'} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {view === 'result' && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center text-center space-y-8 py-12"
                  >
                    <div className="relative">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                          className={`w-48 h-48 rounded-full border-4 ${isXSocialMedia ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_50px_rgba(59,130,246,0.3)]' : isAndroid ? 'border-cyan-400 bg-cyan-400/10 shadow-[0_0_50px_rgba(34,211,238,0.3)]' : isSaturn ? 'border-amber-200 bg-amber-200/10 shadow-[0_0_50px_rgba(252,211,77,0.3)]' : isSun ? 'border-orange-500 bg-orange-500/10 shadow-[0_0_50px_rgba(249,115,22,0.3)]' : isBlackHole ? 'border-violet-500 bg-violet-500/10 shadow-[0_0_50px_rgba(139,92,246,0.3)]' : isChess ? 'border-amber-500 bg-amber-500/10 shadow-[0_0_50px_rgba(245,158,11,0.3)]' : isAlien ? 'border-lime-500 bg-lime-500/10 shadow-[0_0_50px_rgba(132,204,22,0.3)]' : isEarth ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_50px_rgba(16,185,129,0.3)]' : 'border-blue-500 bg-blue-500/10 shadow-[0_0_50px_rgba(59,130,246,0.3)]'} flex flex-col items-center justify-center`}
                        >
                          <span className="text-5xl font-orbitron font-bold text-white">{score}</span>
                          <span className={`text-xs font-orbitron ${isAndroid ? 'text-cyan-400' : isSaturn ? 'text-amber-100' : isSun ? 'text-orange-400' : isBlackHole ? 'text-violet-400' : isChess ? 'text-amber-400' : isAlien ? 'text-lime-400' : isEarth ? 'text-emerald-400' : 'text-blue-400'} tracking-widest mt-2`}>ACERTOS</span>
                        </motion.div>
                      <div className="absolute -top-4 -right-4 p-3 bg-amber-500 rounded-full shadow-lg">
                        <Trophy className="w-6 h-6 text-white" />
                      </div>
                    </div>

                    <div className="space-y-4 max-w-md">
                      <h3 className="text-2xl font-orbitron text-white tracking-widest uppercase">
                        {score === 10 ? 'PERFEITO!' : score >= 7 ? 'EXCELENTE!' : score >= 4 ? 'BOM TRABALHO!' : 'CONTINUE EXPLORANDO!'}
                      </h3>
                      <p className="text-slate-400 font-orbitron text-sm leading-relaxed">
                        {getMotivationalPhrase()}
                      </p>
                    </div>

                    <div className="flex gap-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setView('info');
                          setScore(0);
                          setCurrentQuestion(0);
                        }}
                        className="px-8 py-4 bg-white/10 border border-white/20 text-white font-orbitron text-xs tracking-widest rounded-xl hover:bg-white/20 transition-colors"
                      >
                        RECOMEÇAR
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onClose}
                        className={`px-8 py-4 ${isXSocialMedia ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20' : isAndroid ? 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-500/20' : isSaturn ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-500/20' : isSun ? 'bg-orange-600 hover:bg-orange-500 shadow-orange-500/20' : isBlackHole ? 'bg-violet-600 hover:bg-violet-500 shadow-violet-500/20' : isChess ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-500/20' : isAlien ? 'bg-lime-600 hover:bg-lime-500 shadow-lime-500/20' : isEarth ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20'} text-white font-orbitron text-xs tracking-widest rounded-xl transition-colors shadow-lg`}
                      >
                        FECHAR
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer Decoration */}
            <div className={`h-1 w-full bg-gradient-to-r from-transparent ${isXSocialMedia ? 'via-blue-500/50' : isAndroid ? 'via-cyan-500/50' : isSaturn ? 'via-amber-200/50' : isSun ? 'via-orange-500/50' : isBlackHole ? 'via-violet-500/50' : isChess ? 'via-amber-500/50' : isAlien ? 'via-lime-500/50' : isEarth ? 'via-emerald-500/50' : 'via-blue-500/50'} to-transparent`} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Trophy = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);
