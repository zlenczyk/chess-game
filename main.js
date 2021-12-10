function onDragStart (source, piece, position, orientation) {
  if ((orientation === 'white' && piece.search(/^w/) === -1) ||
      (orientation === 'black' && piece.search(/^b/) === -1)) {
    return false
  }
}

let bool = false;

function onDrop(source, target, piece, newPos, oldPos, orientation) {
  bool = false;
  updateBoard();
  calculateHumanAllowedMoves();
  for(let key in playerAllovedMoves){
    if(key === source){
      for(let value in playerAllovedMoves[key]){
        if(target === playerAllovedMoves[key][value]){
          bool = true;
        }
      }
    }
  }  
  if(bool === false){ 
    return 'snapback';
  }
  else{
    playerFigures[target] = playerFigures[source];
    delete playerFigures[source];
    if(target in botFigures){
      delete botFigures[target];
      configCopy.position = Object.assign(botFigures,playerFigures);
      configCopy.orientation = orientation;
      configCopy.draggable = true;
      board = Chessboard('board1', configCopy);
      updateBoard();
    }
    if(playerFigures[target] === playerColorSymbol.concat('P')){
      promotePawn(playerPromotionLine, playerColorSymbol, target);
    }
    botMove();
  }
}

var config = {
  orientation: 'white',
  draggable: false,
  position: {
    d8: 'bQ',    //bK - czarny Hetman
    e8: 'bK',    //bQ - czarny Król 
    a6: 'bP',    //bP - czarny Pionek
    b6: 'bP',
    c6: 'bP',
    d6: 'bP',
    e6: 'bP',
    f6: 'bP',
    g6: 'bP',
    h6: 'bP',
    d1: 'wQ',   //wK - biały Hetman
    e1: 'wK',   //wQ - biały Król
    a3: 'wP',   //wP - biały Pionek
    b3: 'wP',
    c3: 'wP',
    d3: 'wP',
    e3: 'wP',
    f3: 'wP',
    g3: 'wP',
    h3: 'wP',     
  },
  onDragStart: onDragStart,
  onDrop: onDrop
}

let configCopy = Object.assign({}, config);
const restartConfig = Object.assign({}, config);

const lastBoardLine = ['a8','b8','c8','d8','e8','f8','g8','h8'];
const firstBoardLine = ['a1','b1','c1','d1','e1','f1','g1','h1'];

let kingAlive = true;

const blackPawnMoves = [[0,-1],[-1,-1],[1,-1]];                            // wektory ruchu czarnego Pionka
const whitePawnMoves = [[0,1],[-1,1],[1,1]];                               // wektory ruchu białego Pionka

const QueenMoves = [[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]];  // wektory ruchu Hetmana
const KingMoves = [[0,1],[0,-1],[1,0],[-1,0]];                               // wektory ruchu Króla

const colors = ['white', 'black'];
let color;

let board = Chessboard('board1', config);

let blackFigures = {};
let whiteFigures = {};

let botFigures = {};
let playerFigures = {};

let playerColorSymbol;
let botColorSymbol;

let playerPromotionLine;
let botPromotionLine;

let figures;

let botAllovedMoves = {};
let playerAllovedMoves = {};

function randomColor(){
  color = colors[Math.floor(Math.random()*colors.length)];
}

function setColor(choosenColor){
  color = choosenColor;
  setGame();
}

function setGame(){
    if(color === 'white'){
      config.orientation = 'white';
      board = Chessboard('board1', config);
    }
    else{
      config.orientation = 'black';
      board = Chessboard('board1', config);
    }
    splitColors();
    splitFigures();
}

function splitColors(){
  figures = {};
  figures = board.position();
  whiteFigures = {};
  blackFigures = {};
  for(let i in figures){
    if(figures[i].includes('w')){
      whiteFigures[i]=figures[i];
    }
    else{blackFigures[i]=figures[i];}
  }
}

function splitFigures(){
  playerFigures = {};
  botFigures = {};
  if(color === 'white'){
    playerFigures = whiteFigures;
    botFigures = blackFigures;
    playerColorSymbol = 'w';
    botColorSymbol = 'b';
    playerPromotionLine = lastBoardLine;
    botPromotionLine = firstBoardLine;
  }
  else{ 
    playerFigures = blackFigures;
    botFigures = whiteFigures;
    playerColorSymbol = 'b';
    botColorSymbol = 'w';
    playerPromotionLine = firstBoardLine;
    botPromotionLine = lastBoardLine;
  }
}

function arrayEquals(a, b) {
  return Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((val, index) => val === b[index]);
}

function promotePawn(promotionLine, colorSymbol, pawnPosition){
  if(promotionLine.includes(pawnPosition)){
    let pawnColorSymbol = colorSymbol.concat('Q');
    delete configCopy.position;
    configCopy.position = Object.assign(botFigures,playerFigures);
    configCopy.position[pawnPosition]=pawnColorSymbol;
    configCopy.orientation = color;
    updateBoard();
    board = Chessboard('board1', configCopy);
  }
}

function botMove(){
  config.draggable = false;
  botAllovedMoves = {};
  let playerColor;
  if(color === 'white') {playerColor = 'black';}
  else{playerColor = 'white';}
  whereMoveAlloved(botFigures, botAllovedMoves, playerColor);
  botMakeMove(botAllovedMoves);
  //updateBoard();
  config.draggable=true;
  playerAllovedMoves = {};
}

function botMakeMove(allovedMoves){
  const keys = Object.keys(allovedMoves);
  const values = Object.values(allovedMoves);
  let random = Math.floor(Math.random() * keys.length);
  // losowy index z tablicy values dla wylosowanego klucza
  const randomValueIndexFromKey = Math.floor(Math.random() * values[random].length);
  // value spod tego indexu
  const valueOfIndex = values[random][randomValueIndexFromKey];
  const key = keys[random];
  let nextMove = key.concat('-');
  nextMove = nextMove.concat(valueOfIndex);
  botFigures[valueOfIndex] = 
  board.move(nextMove);
  updateBoard();
  if(valueOfIndex in playerFigures){
    delete playerFigures[valueOfIndex];
    configCopy.position = Object.assign(botFigures,playerFigures);
    configCopy.orientation = color;
    configCopy.draggable = true;
    board = Chessboard('board1', configCopy);
    updateBoard();
  }
  if(botFigures[valueOfIndex] === botColorSymbol.concat('P')){
      promotePawn(botPromotionLine, botColorSymbol, valueOfIndex);
  }
}

function calculateHumanAllowedMoves(){
  let humanColor;
  config.draggable = false;
  playerAllovedMoves = {};
  if(color === 'white') {humanColor = 'white';}
  else{humanColor = 'black';}
  whereMoveAlloved(playerFigures, playerAllovedMoves, humanColor);
  updateBoard();
  config.draggable = true;
}

function whereMoveAlloved(whoseFigures, whoseAllovedMoves, playerColor){
  let figureName = '';
  let currFigureAllovedMoves = [];
  for(let j in whoseFigures){
    currFigureAllovedMoves = [];
    if(whoseFigures[j].includes('Q')){
      figureName = 'Q';
      iterateFigureNameMoves(QueenMoves,j,currFigureAllovedMoves, playerColor, figureName);
    }
    else if(whoseFigures[j].includes('K')){
      figureName = 'K';
      iterateFigureNameMoves(KingMoves,j,currFigureAllovedMoves, playerColor, figureName);
    }
    else if(whoseFigures[j].includes('wP')){
      figureName = 'P';
      iterateFigureNameMoves(whitePawnMoves,j,currFigureAllovedMoves, playerColor, 'wP');
    }
    else {
      figureName = 'P';
      iterateFigureNameMoves(blackPawnMoves,j,currFigureAllovedMoves, playerColor, 'bP');
    }
    whoseAllovedMoves[j] = currFigureAllovedMoves;
  }
}

function iterateFigureNameMoves(figureNameMoves,j,currFigureAllovedMoves, playerColor, figure){
  for(let i in figureNameMoves){
    let letterAscii = j.charCodeAt(0)+figureNameMoves[i][0];
    let digit = parseInt(j.charAt(1))+figureNameMoves[i][1];
    isOnBoard(letterAscii, digit, currFigureAllovedMoves, playerColor, figure, figureNameMoves[i]);
  }
}

function isOnBoard(letterAscii, digit, currFigureAllovedMoves, playerColor, figure, i){
  if(letterAscii >= 97 && letterAscii <= 104 && digit >= 1 && digit <= 8){
    let nextPosition = String.fromCharCode(letterAscii).concat(digit.toString());
    checkColorAndPush(playerColor, currFigureAllovedMoves, nextPosition, figure, i);
  }
}

function checkColorAndPush(playerColor, currFigureAllovedMoves, nextPosition, figure, i){
  if(playerColor === 'white'){
    if(!(nextPosition in whiteFigures)){
      currFigureAllovedMoves.push(nextPosition);
      let leftDiagonal = [-1,1];
      let rightDiagonal = [1,1];
      let front = [0,1];
      let pawn = 'wP';
      checkIfPawnTakes(leftDiagonal, rightDiagonal, front, figure, pawn, i, currFigureAllovedMoves, nextPosition, blackFigures);
    }
  }
  else{
    if(!(nextPosition in blackFigures)){
      currFigureAllovedMoves.push(nextPosition);
      let leftDiagonal = [-1,-1];
      let rightDiagonal = [1,-1];
      let front = [0,-1];
      let pawn = 'bP';
      checkIfPawnTakes(leftDiagonal, rightDiagonal, front, figure, pawn, i, currFigureAllovedMoves, nextPosition, whiteFigures);
    }
  }
}

function checkIfPawnTakes(leftDiagonal, rightDiagonal, front, currFigure, PawnFigure, motionVector, currFigureAllovedMoves, nextPosition, oponentFigures){
  if(currFigure === PawnFigure && arrayEquals(motionVector, leftDiagonal)){        // jeśli aktualna figura to Pionek i rozważamy ruch w lewo na ukos
    if(!(nextPosition in oponentFigures)){            // jesli ruch pionka po ukosie nie powoduje żadnego bicia
      currFigureAllovedMoves.pop(nextPosition);
    }
  }
  else if(currFigure === PawnFigure && arrayEquals(motionVector, rightDiagonal)){  // jeśli aktualna figura to Pionek i rozważamy ruch w prawo na ukos
    if(!(nextPosition in oponentFigures)){            // jesli ruch pionka po ukosie nie powoduje żadnego bicia
      currFigureAllovedMoves.pop(nextPosition);
    }
  }
  else if(currFigure === PawnFigure && arrayEquals(motionVector, front)){  // jeśli aktualna figura to Pionek i rozważamy ruch do przodu
    if(nextPosition in oponentFigures){               // jesli ruch pionka do przodu powoduje bicie
      currFigureAllovedMoves.pop(nextPosition);
    }
  }
}

function startGame(){
  setGame();
  config.draggable = true;
  if(color === 'white'){
    calculateHumanAllowedMoves();
  }
  else{
    botMove();
  }
}

function restartGame(){
  blackFigures = {};
  whiteFigures = {};
  botFigures = {};
  playerFigures = {};
  config = restartConfig;
  board = Chessboard('board1', config);
}

function updateBoard(){
  splitColors();
  splitFigures();
}
