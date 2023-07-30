/*
Please email me at harqian@nuevaschool.org if you find any bugs!
images from https://commons.wikimedia.org/wiki/Category:PNG_chess_pieces/Standard_transparent
https://editor.p5js.org/harqian/full/LRvnsSYm2
*/

// TODO
// profiling
// add disclaimer for image problem
// add notation at end
// 
// tinker with eval to stop the d5 trap
// 
// fix the bot as white, plays way worse
//

// CHANGES:
//
//
//

var testingVar;

//setting variables

const multipleMoves = false;
const captureColor = "rgb(231,89,58)";
const moveColor = "rgb(124,197,76)";
const checkColor = "rgb(221,70,70)";
const hoverColor = "rgb(92,172,241)";
const selectColor = "rgb(45,136,192)";
const lightTileColor = "rgb(240,218,181)";
const darkTileColor = "rgb(181,137,98)";
const lastMoveFromColor = "rgb(172,163,72)";
const lastMoveToColor = "rgb(207,210,123)";

function botsMakeMoves() {
  if (
    turn === "White" &&
    gameState === 1 &&
    whiteMoves.length != 0 &&
    whiteBotOn
  ) {
    if (whiteBotStrength === 0) {
      botMoveOnBoard(randomlySelect(whiteMoves));
    } else {
      botMoveOnBoard(searchStart(whiteMoves, true, whiteBotStrength));
    }
  } else if (
    turn === "Black" &&
    blackMoves.length != 0 &&
    gameState === 1 &&
    blackBotOn
  ) {
    if (blackBotStrength === 0) {
      botMoveOnBoard(randomlySelect(blackMoves));
    } else {
      botMoveOnBoard(searchStart(blackMoves, false, blackBotStrength));
    }
  }
  setTimeout(botsMakeMoves, botSpeedMiliseconds);
}

//self explanatory variables

const board_description = `
RNBQKBNR
PPPPPPPP
xxxxxxxx
xxxxxxxx
xxxxxxxx
xxxxxxxx
pppppppp
rnbqkbnr
`;

//testing board
// const board_description = `
// xxxxKxxx
// xxxxxxxx
// xxxxxxxx
// xxxxxxxx
// xxxxxxxx
// xxxxxxxx
// xxxxxxxx
// xxxxkRxx
// `;

var whiteMoves = [];
var blackMoves = [];
// 0 pawn, 1 knight, 2 bishop, 3 rook, 4 queen
var whitePieces = [0, 0, 0, 0, 0];
var blackPieces = [0, 0, 0, 0, 0];
var whiteVision = [];
var blackVision = [];
var whiteKingPos = { x: 4, y: 7 };
var blackKingPos = { x: 4, y: 0 };
var lastMove;
var special = null;
var selectedPiece;
var selectedPieceCoords;
var promotionPiece = "q";
var boardPieces;
var showSign = 0;
var gameState = 2;
var turn = "White";
var turnNumber = 0;
var bitstringHistory = [];
var historyNum;
var boardHistory = [];
var lastMoveHistory = [];
var checkHistory = [];
var bitstringCount = {};
var isThreeFolded = false;
var isResigned = false;
var switchThingForHistoryNum = false;
var whiteBotStrength;
var blackBotStrength;
var whiteBotOn = false;
var blackBotOn = true;
var tempSquareSize;
var squareSize = 90;
var pieceSize = squareSize;
var dperspective = true;
var chessSounds;



//useful fucntions

function inverseColor(color) {
  if (color === "White") {
    return "Black";
  } else {
    return "White";
  }
}

function colorToSign(color) {
  if (color === "White") {
    return 1;
  } else {
    return -1;
  }
}

function arrayIsSame(a1, a2) {
  for (var i = 0; i < a1.length; i++) {
    if (a1[i] != a2[i]) {
      return false;
    }
  }
  return true;
}

function xyContains(a, obj) {
  if (Array.isArray(a)) {
    for (var i = 0; i < a.length; i++) {
      if (a[i].x === obj.x && a[i].y === obj.y) {
        return true;
      }
    }
  } else {
    if (a.x === obj.x && a.y === obj.y) {
      return true;
    }
  }
  return false;
}

function deltaContains(a, obj) {
  if (Array.isArray(a)) {
    for (var i = 0; i < a.length; i++) {
      if (a[i].deltaX === obj.deltaX && a[i].deltaY === obj.deltaY) {
        return true;
      }
    }
  } else {
    if (a.deltaX === obj.deltaX && a.deltaY === obj.deltaY) {
      return true;
    }
  }
  return false;
}

function isInBoard(x, y) {
  if (x > -1 && x < 8 && y > -1 && y < 8) {
    return true;
  }
  return false;
}

function letterize(int) {
  var letters = "abcdefgh";
  return letters[int];
}

function checkWin(turn, isThreeFolded, whitePieces, blackPieces, whiteMoves, blackMoves, whiteVision, blackVision, whiteKingPos, blackKingPos){
  if (turn === "White") {
    if (
      whiteMoves.length === 0 &&
      checkCheck(whiteVision, blackVision, whiteKingPos, blackKingPos, "White")
    ) {
      return [true, "Checkmate: Black wins!"]
    }
    if (
      whiteMoves.length === 0 &&
      !checkCheck(whiteVision, blackVision, whiteKingPos, blackKingPos, "White")
    ) {
      return [true, "Stalemate: DRAW!"]
    }
  } else {
    if (
      blackMoves.length === 0 &&
      checkCheck(whiteVision, blackVision, whiteKingPos, blackKingPos, "Black")
    ) {
      return [true, "Checkmate: White wins!"]
    }

    if (
      blackMoves.length === 0 &&
      !checkCheck(whiteVision, blackVision, whiteKingPos, blackKingPos, "Black")
    ) {
      return [true, "Stalemate: DRAW!"]
    }
  }
  if (
    (arrayIsSame(whitePieces, [0, 0, 1, 0, 0]) &&
      arrayIsSame(blackPieces, [0, 0, 0, 0, 0])) ||
    (arrayIsSame(whitePieces, [0, 0, 0, 0, 0]) &&
      arrayIsSame(blackPieces, [0, 0, 1, 0, 0])) ||
    (arrayIsSame(whitePieces, [0, 1, 0, 0, 0]) &&
      arrayIsSame(blackPieces, [0, 0, 0, 0, 0])) ||
    (arrayIsSame(whitePieces, [0, 0, 0, 0, 0]) &&
      arrayIsSame(blackPieces, [0, 1, 0, 0, 0])) ||
    (arrayIsSame(whitePieces, [0, 0, 0, 0, 0]) &&
      arrayIsSame(blackPieces, [0, 0, 0, 0, 0]))
  ) {
    return [true, "Insufficient Material: DRAW!"]
  }
  if (isThreeFolded) {
    return [true, "Threefold Repetition: DRAW!"]
  }
  return [false]
}

function checkCheck(
  whiteVision,
  blackVision,
  whiteKingPos,
  blackKingPos,
  color
) {
  if (color === "White") {
    if (xyContains(blackVision, whiteKingPos)) {
      return true;
    }
  } else if (color === "Black") {
    if (xyContains(whiteVision, blackKingPos)) {
      return true;
    }
  }
  return false;
}

function enPassantCheck(board, color, direction, x, y) {
  if (color === "White" && y === 3) {
    if (
      board[3][x + 1] &&
      board[3][x + 1].type === "pawn" &&
      board[3][x + 1].qualified === true &&
      direction === "Right"
    ) {
      return true;
    }
    if (
      board[3][x - 1] &&
      board[3][x - 1].type === "pawn" &&
      board[3][x - 1].qualified === true &&
      direction === "Left"
    ) {
      return true;
    }
  }
  if (color === "Black" && y === 4) {
    if (
      board[4][x + 1] &&
      board[4][x + 1].type === "pawn" &&
      board[4][x + 1].qualified === true &&
      direction === "Right"
    ) {
      return true;
    }
    if (
      board[4][x - 1] &&
      board[4][x - 1].type === "pawn" &&
      board[4][x - 1].qualified === true &&
      direction === "Left"
    ) {
      return true;
    }
  }
  return false;
}

function promotionCheck(color, type, y) {
  if (type === "pawn") {
    if (color === "White" && y === 0) {
      return true;
    }
    if (color === "Black" && y === 7) {
      return true;
    }
    return false;
  }
}

function castleCheck(
  whiteVision,
  blackVision,
  whiteKingPos,
  blackKingPos,
  board,
  color,
  direction
) {
  if (color === "White") {
    if (
      direction === "Right" &&
      board[7][4] &&
      board[7][7] &&
      board[7][4].moved === false &&
      board[7][7].moved === false &&
      board[7][7].color === "White" &&
      board[7][5] === null &&
      board[7][6] === null &&
      !xyContains(blackVision, { x: 5, y: 7 }) &&
      !xyContains(blackVision, { x: 6, y: 7 }) &&
      !checkCheck(whiteVision, blackVision, whiteKingPos, blackKingPos, "White")
    ) {
      return true;
    }
    if (
      direction === "Left" &&
      board[7][4] &&
      board[7][0] &&
      board[7][4].moved === false &&
      board[7][0].moved === false &&
      board[7][0].color === "White" &&
      board[7][1] === null &&
      board[7][2] === null &&
      board[7][3] === null &&
      !xyContains(blackVision, { x: 2, y: 7 }) &&
      !xyContains(blackVision, { x: 3, y: 7 }) &&
      !checkCheck(whiteVision, blackVision, whiteKingPos, blackKingPos, "White")
    ) {
      return true;
    }
  }
  if (color === "Black") {
    if (
      direction === "Right" &&
      board[0][4] &&
      board[0][7] &&
      board[0][4].moved === false &&
      board[0][7].moved === false &&
      board[0][7].color === "Black" &&
      board[0][5] === null &&
      board[0][6] === null &&
      !xyContains(whiteVision, { x: 5, y: 0 }) &&
      !xyContains(whiteVision, { x: 6, y: 0 }) &&
      !checkCheck(whiteVision, blackVision, whiteKingPos, blackKingPos, "Black")
    ) {
      return true;
    }
    if (
      direction === "Left" &&
      board[0][4] &&
      board[0][0] &&
      board[0][4].moved === false &&
      board[0][0].moved === false &&
      board[0][0].color === "Black" &&
      board[0][1] === null &&
      board[0][2] === null &&
      board[0][3] === null &&
      !xyContains(whiteVision, { x: 2, y: 0 }) &&
      !xyContains(whiteVision, { x: 3, y: 0 }) &&
      !checkCheck(whiteVision, blackVision, whiteKingPos, blackKingPos, "Black")
    ) {
      return true;
    }
    return false;
  }
}

function move(
  board,
  from,
  to,
  special,
  replacement,
  promoP,
  thePieceThatWasTaken
) {
  thePieceThatWasTaken[0] = board[to.y][to.x];

  board[to.y][to.x] = board[from.y][from.x];

  if (special != null && special != undefined) {
    if (special.type === "castle") {
      if (special.side === "Left") {
        board[to.y][to.x - special.xOffset] =
          board[to.y][to.x + 2 * special.xOffset];
        board[to.y][to.x + 2 * special.xOffset] = replacement;
      }
      if (special.side === "Right") {
        board[to.y][to.x - special.xOffset] =
          board[to.y][to.x + special.xOffset];
        board[to.y][to.x + special.xOffset] = replacement;
      }
    }
    if (special.type === "enPassant") {
      thePieceThatWasTaken[0] = board[to.y + special.yOffset][to.x];
      board[to.y + special.yOffset][to.x] = replacement;
    }
    if (special.type === "promotion" && !promoP) {
      board[to.y][to.x] = convertCharToClassWithColor(
        special.piece,
        board[from.y][from.x].color
      );
      thePieceThatWasTaken[3] = board[from.y][from.x];
    }
    // case where player promotes, promoP takes input from promotionPiece
    if (promoP) {
      board[to.y][to.x] = convertCharToClassWithColor(
        promoP,
        board[from.y][from.x].color
      );
    }
  }
  board[from.y][from.x] = replacement;
  board[to.y][to.x].updateKingPos(
    to.x,
    to.y,
    board[to.y][to.x].type,
    board[to.y][to.x].color
  );
}

function undoMove(board, from, to, special, replacement, thePieceThatWasTaken) {
  board[from.y][from.x] = board[to.y][to.x];

  if (special != null && special != undefined) {
    if (special.type === "castle") {
      if (special.side === "Left") {
        board[to.y][to.x + 2 * special.xOffset] =
          board[to.y][to.x - special.xOffset];
        board[to.y][to.x - special.xOffset] = replacement;
      }
      if (special.side === "Right") {
        board[to.y][to.x + special.xOffset] =
          board[to.y][to.x - special.xOffset];
        board[to.y][to.x - special.xOffset] = replacement;
      }
    }
    if (special.type === "promotion") {
      board[from.y][from.x] = thePieceThatWasTaken[3];
      board[to.y][to.x] = thePieceThatWasTaken[0];
    }
  }
  if (special != null && special != undefined && special.type === "enPassant") {
    board[to.y][to.x] = replacement;
    board[to.y + special.yOffset][to.x] = thePieceThatWasTaken[0];
  } else {
    board[to.y][to.x] = thePieceThatWasTaken[0];
  }
}

function moveOnBoard(from, to, moveSpecial, promoP) {
  boardPieces[from.y][from.x].moved = true;
  var takenPiece = boardPieces[to.y][to.x]
  move(boardPieces, from, to, moveSpecial, null, promoP, []);
  //move(proxyBoard, from, to, special, 12);
  special = null;
  lastMove = { from: from, to: to };
  lastMoveHistory.push(lastMove);
  bitstringHistory.push(boardToBitstring(boardPieces));
  bitstringCount = {};
  for (let bitstring of bitstringHistory) {
    if (bitstringCount[bitstring]) {
      bitstringCount[bitstring]++;
      if (bitstringCount[bitstring] === 3) {
        isThreeFolded = true;
        break;
      }
    } else {
      bitstringCount[bitstring] = 1;
    }
  }
  turnNumber++;
  turn = inverseColor(turn);
  var infoArr = pieceUpdates(boardPieces, turn);
  whiteMoves = infoArr[0];
  blackMoves = infoArr[1];
  whitePieces = infoArr[2];
  blackPieces = infoArr[3];
  whiteVision = infoArr[4];
  blackVision = infoArr[5];
  if (checkWin(turn, isThreeFolded, whitePieces, blackPieces, whiteMoves, blackMoves, whiteVision, blackVision, whiteKingPos, blackKingPos)[0]){
    gameEndCalls();
    if (checkWin(turn, isThreeFolded, whitePieces, blackPieces, whiteMoves, blackMoves, whiteVision, blackVision, whiteKingPos, blackKingPos)[1] === "Checkmate: White wins!" || checkWin(turn, isThreeFolded, whitePieces, blackPieces, whiteMoves, blackMoves, whiteVision, blackVision, whiteKingPos, blackKingPos)[1] === "Checkmate: Black wins!"){
      chessSounds.play(0, 1, 1, 12.2, 0.5)
    } else if (checkWin(turn, isThreeFolded, whitePieces, blackPieces, whiteMoves, blackMoves, whiteVision, blackVision, whiteKingPos, blackKingPos)[1] === "Stalemate: DRAW!"){
      chessSounds.play(0, 1, 1, 11.2, 0.5)
    } else if (checkWin(turn, isThreeFolded, whitePieces, blackPieces, whiteMoves, blackMoves, whiteVision, blackVision, whiteKingPos, blackKingPos)[1] === "Insufficient Material: DRAW!"){
      chessSounds.play(0, 1, 1, 10.2, 0.4)
    } 
  } else if (checkCheck(whiteVision, blackVision, whiteKingPos, blackKingPos, "White") || checkCheck(whiteVision, blackVision, whiteKingPos, blackKingPos, "Black")){
    chessSounds.play(0, 1, 1, 8.0, 0.5)
  } else if (moveSpecial && moveSpecial.type === "castle"){
    chessSounds.play(0, 1, 1, 4.1, 0.4)
  } else if (takenPiece || (moveSpecial && moveSpecial.type === "enPassant")){
    chessSounds.play(0, 1, 1, 6.2, 0.4)
  } else{
    chessSounds.play(0, 1, 1, 2.1, 0.3)
  }
}

function botMoveOnBoard(move) {
  moveOnBoard(
    { x: move.fromX, y: move.fromY },
    { x: move.fromX + move.deltaX, y: move.fromY + move.deltaY },
    move.special
  );
  showSign = 1;
}

function boardToBitstring(board, perspective) {
  var bitstring = "";
  for (let x = 0; x < 8; x++) {
    for (let y = 0; y < 8; y++) {
      var piece = board[x][y];
      if (piece != null) {
        if (piece.color === "White") {
          bitstring = bitstring + convertPieceToCharWithColor(piece, "White");
        } else {
          bitstring = bitstring + convertPieceToCharWithColor(piece, "Black");
        }
      } else {
        bitstring = bitstring + "x";
      }
    }
    bitstring = bitstring + "/";
  }
  return bitstring;
}

function doubleLayerSearch(movesArr) {
  var evals = [];
  for (let i = 0; i < movesArr.length; i++) {
    let sTempBoard = [
      ...boardPieces.map((arr) => [
        ...arr.map((cls) => {
          if (cls === null || cls === undefined) {
            return null;
          } else {
            return Object.assign(
              Object.create(Object.getPrototypeOf(cls)),
              cls
            );
          }
        }),
      ]),
    ];
    move(
      sTempBoard,
      { x: movesArr[i].fromX, y: movesArr[i].fromY },
      {
        x: movesArr[i].fromX + movesArr[i].deltaX,
        y: movesArr[i].fromY + movesArr[i].deltaY,
      },
      movesArr[i].special,
      null,
      null,
      []
    );
    var sTempWhiteMoves,
      sTempBlackMoves,
      sTempWhitePieces,
      sTempBlackPieces,
      sTempWhiteVision,
      sTempBlackVision;
    var infoArr = pieceUpdates(sTempBoard, "White");
    sTempWhiteMoves = infoArr[0];
    sTempBlackMoves = infoArr[1];
    sTempWhitePieces = infoArr[2];
    sTempBlackPieces = infoArr[3];
    sTempWhiteVision = infoArr[4];
    sTempBlackVision = infoArr[5];
    let extraEvals = [];
    if (sTempWhiteMoves.length != 0) {
      for (let o = 0; o < sTempWhiteMoves.length; o++) {
        let sExtraTempBoard = [
          ...sTempBoard.map((arr) => [
            ...arr.map((cls) => {
              if (cls === null || cls === undefined) {
                return null;
              } else {
                return Object.assign(
                  Object.create(Object.getPrototypeOf(cls)),
                  cls
                );
              }
            }),
          ]),
        ];
        move(
          sExtraTempBoard,
          { x: sTempWhiteMoves[o].fromX, y: sTempWhiteMoves[o].fromY },
          {
            x: sTempWhiteMoves[o].fromX + sTempWhiteMoves[o].deltaX,
            y: sTempWhiteMoves[o].fromY + sTempWhiteMoves[o].deltaY,
          },
          sTempWhiteMoves[o].special,
          null,
          null,
          []
        );
        extraEvals[o] = evaluation(sExtraTempBoard);
      }
      evals.push(Math.max(...extraEvals));
    } else {
      if (
        checkCheck(
          sTempWhiteVision,
          sTempBlackVision,
          whiteKingPos,
          blackKingPos,
          "White"
        )
      ) {
        evals.push(-100000000);
      } else {
        evals.push(0);
      }
    }
  }
  return movesArr[evals.indexOf(Math.min(...evals))];
}

function colorizedDoubleLayerSearch(movesArr, color) {
  var evals = [];
  for (let i = 0; i < movesArr.length; i++) {
    let thePieceThatWasTaken = [
      boardPieces[movesArr[i].fromY + movesArr[i].deltaY][
        movesArr[i].fromX + movesArr[i].deltaX
      ],
    ];
    move(
      boardPieces,
      { x: movesArr[i].fromX, y: movesArr[i].fromY },
      {
        x: movesArr[i].fromX + movesArr[i].deltaX,
        y: movesArr[i].fromY + movesArr[i].deltaY,
      },
      movesArr[i].special,
      null,
      null,
      thePieceThatWasTaken
    );
    var sTempWhiteMoves,
      sTempBlackMoves,
      sTempWhitePieces,
      sTempBlackPieces,
      sTempWhiteVision,
      sTempBlackVision;
    var infoArr = pieceUpdates(boardPieces, inverseColor(color));
    sTempWhiteMoves = infoArr[0];
    sTempBlackMoves = infoArr[1];
    sTempWhitePieces = infoArr[2];
    sTempBlackPieces = infoArr[3];
    sTempWhiteVision = infoArr[4];
    sTempBlackVision = infoArr[5];
    let extraEvals = [];
    var tempMovesArr;
    if (color === "Black") {
      tempMovesArr = sTempWhiteMoves;
    } else {
      tempMovesArr = sTempBlackMoves;
    }
    if (tempMovesArr.length != 0) {
      for (let o = 0; o < tempMovesArr.length; o++) {
        let thePieceThatWasTaken1 = [
          boardPieces[tempMovesArr[o].fromY + tempMovesArr[o].deltaY][
            tempMovesArr[o].fromX + tempMovesArr[o].deltaX
          ],
        ];
        move(
          boardPieces,
          { x: tempMovesArr[o].fromX, y: tempMovesArr[o].fromY },
          {
            x: tempMovesArr[o].fromX + tempMovesArr[o].deltaX,
            y: tempMovesArr[o].fromY + tempMovesArr[o].deltaY,
          },
          tempMovesArr[o].special,
          null,
          null,
          thePieceThatWasTaken1
        );
        var sTempWhiteMoves1,
          sTempBlackMoves1,
          sTempWhitePieces1,
          sTempBlackPieces1,
          sTempWhiteVision1,
          sTempBlackVision1;
        var infoArr1 = pieceUpdates(boardPieces, color);
        sTempWhiteMoves1 = infoArr1[0];
        sTempBlackMoves1 = infoArr1[1];
        sTempWhitePieces1 = infoArr1[2];
        sTempBlackPieces1 = infoArr1[3];
        sTempWhiteVision1 = infoArr1[4];
        sTempBlackVision1 = infoArr1[5];
        var tempMovesArr1;
        if (color === "Black") {
          tempMovesArr1 = infoArr1[1];
        } else {
          tempMovesArr1 = infoArr1[0];
        }
        if (tempMovesArr1.length === 0) {
          if (
            checkCheck(
              infoArr1[4],
              infoArr1[5],
              whiteKingPos,
              blackKingPos,
              color
            )
          ) {
            extraEvals[o] = -100000000 * colorToSign(color);
          } else {
            extraEvals[o] = 0;
          }
        } else {
          extraEvals[o] = evaluation(boardPieces);
        }
        undoMove(
          boardPieces,
          { x: tempMovesArr[o].fromX, y: tempMovesArr[o].fromY },
          {
            x: tempMovesArr[o].fromX + tempMovesArr[o].deltaX,
            y: tempMovesArr[o].fromY + tempMovesArr[o].deltaY,
          },
          tempMovesArr[o].special,
          null,
          thePieceThatWasTaken1
        );
        boardPieces[tempMovesArr[o].fromY][tempMovesArr[o].fromX].updateKingPos(
          tempMovesArr[o].fromX,
          tempMovesArr[o].fromY,
          boardPieces[tempMovesArr[o].fromY][tempMovesArr[o].fromX].type,
          boardPieces[tempMovesArr[o].fromY][tempMovesArr[o].fromX].color
        );
      }
      if (color === "Black") {
        evals.push(Math.max(...extraEvals));
      } else {
        evals.push(Math.min(...extraEvals));
      }
    } else {
      if (
        checkCheck(
          sTempWhiteVision,
          sTempBlackVision,
          whiteKingPos,
          blackKingPos,
          inverseColor(color)
        )
      ) {
        evals.push(100000000 * colorToSign(color));
      } else {
        evals.push(0);
      }
    }
    undoMove(
      boardPieces,
      { x: movesArr[i].fromX, y: movesArr[i].fromY },
      {
        x: movesArr[i].fromX + movesArr[i].deltaX,
        y: movesArr[i].fromY + movesArr[i].deltaY,
      },
      movesArr[i].special,
      null,
      thePieceThatWasTaken
    );
    boardPieces[movesArr[i].fromY][movesArr[i].fromX].updateKingPos(
      movesArr[i].fromX,
      movesArr[i].fromY,
      boardPieces[movesArr[i].fromY][movesArr[i].fromX].type,
      boardPieces[movesArr[i].fromY][movesArr[i].fromX].color
    );
  }
  if (color === "Black") {
    return movesArr[evals.indexOf(Math.min(...evals))];
  } else {
    return movesArr[evals.indexOf(Math.max(...evals))];
  }
}

function searchStart(movesArr, isMaximizingPlayer, depth) {
  let alpha1 = -Infinity;
  let beta1 = Infinity;
  var bestMove;
  movesArr.sort(function (a, b) {
    return 0.5 - Math.random();
  });
  var bestMoveValue = isMaximizingPlayer ? -Infinity : Infinity;

  for (let move1 of movesArr) {
    let undoArr = [];
    // Make the move, but undo before exiting loop
    // move(
    //   boardPieces,
    //   { x: move1.fromX, y: move1.fromY },
    //   {
    //     x: move1.fromX + move1.deltaX,
    //     y: move1.fromY + move1.deltaY,
    //   },
    //   move1.special,
    //   null,
    //   null,
    //   thePieceThatWasTaken
    // );
    calcMoveOnBoard(
      { x: move1.fromX, y: move1.fromY },
      {
        x: move1.fromX + move1.deltaX,
        y: move1.fromY + move1.deltaY,
      },
      move1.special,
      undoArr
    );

    // Recursively get the value from this move
    if (undoArr[3] === "true") {
      value = 0;
    } else {
      value = search(depth - 1, alpha1, beta1, !isMaximizingPlayer);
    }

    if (isMaximizingPlayer) {
      // Look for moves that maximize position
      if (value > bestMoveValue) {
        bestMoveValue = value;
        bestMove = move1;
      }
      alpha1 = Math.max(alpha1, value);
    } else {
      // Look for moves that minimize position
      if (value < bestMoveValue) {
        bestMoveValue = value;
        bestMove = move1;
      }
      beta1 = Math.min(beta1, value);
    }
    // Undo previous move
    // undoMove(
    //   boardPieces,
    //   { x: move1.fromX, y: move1.fromY },
    //   {
    //     x: move1.fromX + move1.deltaX,
    //     y: move1.fromY + move1.deltaY,
    //   },
    //   move1.special,
    //   null,
    //   thePieceThatWasTaken
    // );
    undoCalcMoveOnBoard(
      { x: move1.fromX, y: move1.fromY },
      {
        x: move1.fromX + move1.deltaX,
        y: move1.fromY + move1.deltaY,
      },
      move1.special,
      undoArr
    );
    // Check for alpha beta pruning
    if (beta1 <= alpha1) {
      break;
    }
  }
  return bestMove;
}

function search(depth, alpha2, beta2, isMaximizingPlayer1) {
  // Base case: evaluate board
  if (depth === 0) {
    return evaluation(boardPieces);
  }
  // Recursive case: search possible moves
  var bestMove; // best move not set yet

  var infoArr = movesUpdate(
    boardPieces,
    isMaximizingPlayer1 ? "White" : "Black"
  );
  var possibleMoves = infoArr[0];
  var vision = infoArr[1];
  if (possibleMoves.length === 0) {
    if (
      isMaximizingPlayer1
        ? checkCheck(whiteVision, vision, whiteKingPos, blackKingPos, "White")
        : checkCheck(vision, blackVision, whiteKingPos, blackKingPos, "Black")
    ) {
      return 100000000 * (isMaximizingPlayer1 ? -1 : 1) * depth;
    } else {
      return 0;
    }
  }

  // Set random order for possible moves
  possibleMoves.sort(function (a, b) {
    return 0.5 - Math.random();
  });
  // Set a default best move value
  var bestMoveValue = isMaximizingPlayer1 ? -Infinity : Infinity;
  // Search through all possible moves
  for (let move2 of possibleMoves) {
    let undoArr1 = [];
    // Make the move, but undo before exiting loop
    calcMoveOnBoard(
      { x: move2.fromX, y: move2.fromY },
      {
        x: move2.fromX + move2.deltaX,
        y: move2.fromY + move2.deltaY,
      },
      move2.special,
      undoArr1
    );
    // move(
    //   boardPieces,
    //   { x: move2.fromX, y: move2.fromY },
    //   {
    //     x: move2.fromX + move2.deltaX,
    //     y: move2.fromY + move2.deltaY,
    //   },
    //   move2.special,
    //   null,
    //   null,
    //   thePieceThatWasTaken
    // );
    // Recursively get the value from this move
    if (undoArr1[3] === "true") {
      value1 = 0;
    } else {
      value1 = search(depth - 1, alpha2, beta2, !isMaximizingPlayer1);
    }

    if (isMaximizingPlayer1) {
      // Look for moves that maximize position
      if (value1 > bestMoveValue) {
        bestMoveValue = value1;
      }
      alpha2 = Math.max(alpha2, value1);
    } else {
      // Look for moves that minimize position
      if (value1 < bestMoveValue) {
        bestMoveValue = value1;
      }
      beta2 = Math.min(beta2, value1);
    }
    // Undo previous move
    // undoMove(
    //   boardPieces,
    //   { x: move2.fromX, y: move2.fromY },
    //   {
    //     x: move2.fromX + move2.deltaX,
    //     y: move2.fromY + move2.deltaY,
    //   },
    //   move2.special,
    //   null,
    //   thePieceThatWasTaken
    // );
    undoCalcMoveOnBoard(
      { x: move2.fromX, y: move2.fromY },
      {
        x: move2.fromX + move2.deltaX,
        y: move2.fromY + move2.deltaY,
      },
      move2.special,
      undoArr1
    );
    // Check for alpha beta pruning
    if (beta2 <= alpha2) {
      break;
    }
  }
  return bestMoveValue;
}

function calcMoveOnBoard(from, to, moveSpecial, undoArr) {
  move(boardPieces, from, to, moveSpecial, null, null, undoArr);
  undoArr[1] = boardPieces[to.y][to.x].moved;
  boardPieces[to.y][to.x].moved = true;
  if (boardPieces[to.y][to.x].type === "pawn") {
    undoArr[2] = boardPieces[to.y][to.x].qualified;
    if (
      boardPieces[to.y][to.x].moved === true &&
      boardPieces[to.y][to.x].qualified === false
    ) {
      boardPieces[to.y][to.x].qualified = true;
    } else if (
      boardPieces[to.y][to.x].moved === true &&
      boardPieces[to.y][to.x].qualified === true
    ) {
      boardPieces[to.y][to.x].qualified = 1;
    } else {
      boardPieces[to.y][to.x].qualified = 2;
    }
  }
  bitstringHistory.push(boardToBitstring(boardPieces));
  bitstringCount = {};
  for (let bitstring of bitstringHistory) {
    if (bitstringCount[bitstring]) {
      bitstringCount[bitstring]++;
      if (bitstringCount[bitstring] === 3) {
        undoArr[3] = "true";
        break;
      }
    } else {
      bitstringCount[bitstring] = 1;
    }
  }
}

function undoCalcMoveOnBoard(from, to, moveSpecial, undoArr) {
  undoMove(boardPieces, from, to, moveSpecial, null, undoArr);
  boardPieces[from.y][from.x].moved = undoArr[1];
  boardPieces[from.y][from.x].qualified = undoArr[2];
  bitstringHistory.pop();
}

function randomlySelect(movesArr) {
  return movesArr[Math.floor(Math.random() * movesArr.length)];
}

function evaluation(board) {
  // 0 is white, 1 is black
  var pieceEval = [0, 0];
  var MGEval = [0, 0];
  var EGEval = [0, 0];
  var gamePhase = 0;
  for (let x = 0; x < 8; x++) {
    for (let y = 0; y < 8; y++) {
      let evalPiece = board[y][x];
      if (evalPiece) {
        if (evalPiece.color === "White") {
          pieceEval[0] = pieceEval[0] + evalPiece.weight;
          if (evalPiece.type === "pawn") {
            MGEval[0] = MGEval[0] + mg_pawn_table[y * 8 + x];
            EGEval[0] = EGEval[0] + eg_pawn_table[y * 8 + x];
          } else if (evalPiece.type === "rook") {
            MGEval[0] = MGEval[0] + mg_rook_table[y * 8 + x];
            EGEval[0] = EGEval[0] + eg_rook_table[y * 8 + x];
          } else if (evalPiece.type === "knight") {
            MGEval[0] = MGEval[0] + mg_knight_table[y * 8 + x];
            EGEval[0] = EGEval[0] + eg_knight_table[y * 8 + x];
          } else if (evalPiece.type === "bishop") {
            MGEval[0] = MGEval[0] + mg_bishop_table[y * 8 + x];
            EGEval[0] = EGEval[0] + eg_bishop_table[y * 8 + x];
          } else if (evalPiece.type === "queen") {
            MGEval[0] = MGEval[0] + mg_queen_table[y * 8 + x];
            EGEval[0] = EGEval[0] + eg_queen_table[y * 8 + x];
          } else {
            MGEval[0] = MGEval[0] + mg_king_table[y * 8 + x];
            EGEval[0] = EGEval[0] + eg_king_table[y * 8 + x];
          }
        } else {
          pieceEval[1] = pieceEval[1] + evalPiece.weight;
          if (evalPiece.type === "pawn") {
            MGEval[1] = MGEval[1] + mg_pawn_table[(7 - y) * 8 + x];
            EGEval[1] = EGEval[1] + eg_pawn_table[(7 - y) * 8 + x];
          } else if (evalPiece.type === "rook") {
            MGEval[1] = MGEval[1] + mg_rook_table[(7 - y) * 8 + x];
            EGEval[1] = EGEval[1] + eg_rook_table[(7 - y) * 8 + x];
          } else if (evalPiece.type === "knight") {
            MGEval[1] = MGEval[1] + mg_knight_table[(7 - y) * 8 + x];
            EGEval[1] = EGEval[1] + eg_knight_table[(7 - y) * 8 + x];
          } else if (evalPiece.type === "bishop") {
            MGEval[1] = MGEval[1] + mg_bishop_table[(7 - y) * 8 + x];
            EGEval[1] = EGEval[1] + eg_bishop_table[(7 - y) * 8 + x];
          } else if (evalPiece.type === "queen") {
            MGEval[1] = MGEval[1] + mg_queen_table[(7 - y) * 8 + x];
            EGEval[1] = EGEval[1] + eg_queen_table[(7 - y) * 8 + x];
          } else {
            MGEval[1] = MGEval[1] + mg_king_table[(7 - y) * 8 + x];
            EGEval[1] = EGEval[1] + eg_king_table[(7 - y) * 8 + x];
          }
        }
        if (evalPiece.progress) {
          gamePhase = gamePhase + evalPiece.progress;
        }
      }
    }
  }
  var mgPhase = gamePhase;
  if (mgPhase > 24) {
    mgPhase = 24;
  }
  var egPhase = 24 - mgPhase;
  return (
    (egPhase * (EGEval[0] - EGEval[1]) + mgPhase * (MGEval[0] - MGEval[1])) /
      24 +
    (pieceEval[0] - pieceEval[1])
  );
}

function movementIsLegal(from, to, color, special, board) {
  // special is the type of special move that the move is if it is special if not special, its null
  // color is the color of the piece whose movement were trying to check
  if (
    board[to.y][to.x] === null ||
    (board[to.y][to.x] && board[to.y][to.x].color != color)
  ) {
    let thePieceThatWasTaken = [];
    move(boardPieces, from, to, special, null, null, thePieceThatWasTaken);

    var tempWhiteVision = [];
    var tempBlackVision = [];

    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        let tempPiece = boardPieces[y][x];

        if (tempPiece && tempPiece.color != color) {
          var tempMovement = tempPiece.updateMovement(x, y, boardPieces);
          var tempDelta;
          var tempVision = [];
          if (tempPiece.type === "pawn") {
            if (tempPiece.color === "White") {
              tempDelta = [
                { deltaX: 1, deltaY: -1 },
                { deltaX: -1, deltaY: -1 },
              ];
            } else if (tempPiece.color === "Black") {
              tempDelta = [
                { deltaX: 1, deltaY: 1 },
                { deltaX: -1, deltaY: 1 },
              ];
            }
          } else {
            tempDelta = tempMovement;
          }
          for (let i = 0; i < tempDelta.length; i++) {
            let tempSingleDelta = tempDelta[i];
            tempVision = {
              x: x + tempSingleDelta.deltaX,
              y: y + tempSingleDelta.deltaY,
            };

            if (isInBoard(tempVision.x, tempVision.y)) {
              if (tempPiece.color == "White") {
                tempWhiteVision.push(tempVision);
              }
              if (tempPiece.color == "Black") {
                tempBlackVision.push(tempVision);
              }
            }
          }
        }
      }
    }
    undoMove(boardPieces, from, to, special, null, thePieceThatWasTaken);

    if (
      color === "White" &&
      !checkCheck(
        tempWhiteVision,
        tempBlackVision,
        whiteKingPos,
        blackKingPos,
        "White"
      )
    ) {
      board[from.y][from.x].updateKingPos(
        from.x,
        from.y,
        board[from.y][from.x].type,
        board[from.y][from.x].color
      );

      return true;
    } else if (
      color === "Black" &&
      !checkCheck(
        tempWhiteVision,
        tempBlackVision,
        whiteKingPos,
        blackKingPos,
        "Black"
      )
    ) {
      board[from.y][from.x].updateKingPos(
        from.x,
        from.y,
        board[from.y][from.x].type,
        board[from.y][from.x].color
      );

      return true;
    }
    board[from.y][from.x].updateKingPos(
      from.x,
      from.y,
      board[from.y][from.x].type,
      board[from.y][from.x].color
    );

    return false;
  }
}

function bigSign(textDes) {
  if (showSign === 1) {
    fill("#FAEC78");
    rect(1.5 * squareSize, 2.5 * squareSize, 5 * squareSize, 3 * squareSize);
    fill(0, 0, 0);
    textSize((17.3 / 50) * squareSize);
    text(textDes, 2 * squareSize, 3 * squareSize);
    text(
      "Click on screen to toggle this message, and arrow keys can be used to go back and look at the game",
      2 * squareSize,
      3.2 * squareSize,
      4.5 * squareSize,
      3 * squareSize
    );
  }
}

function turnCheck(piece) {
  if (piece.color === turn) {
    return true;
  } else if (multipleMoves === true) {
    return true;
  }
  return false;
}
//classes
//attributes to all pieces
class Piece {
  constructor(weight, color, image, movement, moved) {
    //worth of a piece
    this.weight = weight;
    //nice system to define images to draw
    this.image = loadImage("chess piece images/" + image + color + ".png");

    //black or white
    this.color = color;
    this.movement = movement;
    this.moved = moved;
    this.type = image;
  }
  // draw movement for piece with coordinates pieceX and pieceY

  drawMovement(x, y, lperspective) {
    for (var i = 0; i < this.movement.length; i++) {
      var delta = this.movement[i];
      var point;
      //variables for where all the movement is
      if (lperspective) {
        if (isInBoard(x + delta.deltaX, y + delta.deltaY)) {
          point = { x: x + delta.deltaX, y: y + delta.deltaY };
        }
        if (point && boardPieces[point.y][point.x] && boardPieces[y][x]) {
          if (boardPieces[y][x].color != boardPieces[point.y][point.x].color) {
            fill(captureColor);

            ellipse(
              point.x * squareSize + squareSize / 2,
              point.y * squareSize + squareSize / 2,
              (1 / 3) * squareSize,
              (1 / 3) * squareSize
            );
          }
        } else if (point && !boardPieces[point.y][point.x]) {
          fill(moveColor);

          ellipse(
            point.x * squareSize + squareSize / 2,
            point.y * squareSize + squareSize / 2,
            (1 / 3) * squareSize,
            (1 / 3) * squareSize
          );
        }
      } else {
        if (isInBoard(7 - x - delta.deltaX, 7 - y - delta.deltaY)) {
          point = { x: 7 - x - delta.deltaX, y: 7 - y - delta.deltaY };
        }
        if (
          point &&
          boardPieces[7 - point.y][7 - point.x] &&
          boardPieces[y][x]
        ) {
          if (
            boardPieces[y][x].color !=
            boardPieces[7 - point.y][7 - point.x].color
          ) {
            fill(captureColor);

            ellipse(
              point.x * squareSize + squareSize / 2,
              point.y * squareSize + squareSize / 2,
              (1 / 3) * squareSize,
              (1 / 3) * squareSize
            );
          }
        } else if (point && !boardPieces[7 - point.y][7 - point.x]) {
          fill(moveColor);

          ellipse(
            point.x * squareSize + squareSize / 2,
            point.y * squareSize + squareSize / 2,
            (1 / 3) * squareSize,
            (1 / 3) * squareSize
          );
        }
      }
    }
  }

  isClickableMove(x, y, clickX, clickY) {
    for (var i = 0; i < this.movement.length; i++) {
      var delta = this.movement[i];
      if (isInBoard(delta.deltaX + x, delta.deltaY + y)) {
        var point = { x: delta.deltaX + x, y: delta.deltaY + y };

        if (point.x == clickX && point.y == clickY) {
          if (delta.special) {
            special = delta.special;
          }
          return true;
        }
      }
    }
    return false;
  }

  updateEnPassant() {
    if (this.moved === true && this.qualified === false) {
      this.qualified = true;
    } else if (this.moved === true && this.qualified === true) {
      this.qualified = null;
    }
  }
  updateMovement() {}
  checkMovement(
    whiteVision,
    blackVision,
    whiteKingPos,
    blackKingPos,
    color,
    board
  ) {
    var newMovement = [];
    var legalSpecial;
    for (let i = 0; i < this.movement.length; i++) {
      if (this.movement[i].special) {
        legalSpecial = this.movement[i].special;
      }

      if (
        isInBoard(
          this.movement[i].deltaX + this.movement[i].fromX,
          this.movement[i].deltaY + this.movement[i].fromY
        ) &&
        movementIsLegal(
          { x: this.movement[i].fromX, y: this.movement[i].fromY },
          {
            x: this.movement[i].deltaX + this.movement[i].fromX,
            y: this.movement[i].deltaY + this.movement[i].fromY,
          },
          color,
          legalSpecial,
          board
        )
      ) {
        if (
          !(
            legalSpecial &&
            legalSpecial.type === "castle" &&
            !(
              (castleCheck(
                whiteVision,
                blackVision,
                whiteKingPos,
                blackKingPos,
                board,
                color,
                "Right"
              ) &&
                legalSpecial.side === "Right") ||
              (castleCheck(
                whiteVision,
                blackVision,
                whiteKingPos,
                blackKingPos,
                board,
                color,
                "Left"
              ) &&
                legalSpecial.side === "Left")
            )
          )
        ) {
          newMovement.push(this.movement[i]);
        }
      }
      legalSpecial = null;
    }

    this.movement = newMovement;
  }
  updateVision(x, y, whiteVision, blackVision) {
    var delta;
    var vision;
    if (this.type === "pawn") {
      if (this.color === "White") {
        delta = [
          { deltaX: 1, deltaY: -1 },
          { deltaX: -1, deltaY: -1 },
        ];
      } else if (this.color === "Black") {
        delta = [
          { deltaX: 1, deltaY: 1 },
          { deltaX: -1, deltaY: 1 },
        ];
      }
    } else {
      delta = this.movement;
    }
    for (let i = 0; i < delta.length; i++) {
      let singleDelta = delta[i];
      vision = { x: x + singleDelta.deltaX, y: y + singleDelta.deltaY };

      if (isInBoard(vision.x, vision.y)) {
        if (this.color == "White") {
          whiteVision.push(vision);
        }
        if (this.color == "Black") {
          blackVision.push(vision);
        }
      }
    }
  }
  updateMoves(x, y, whiteMoves, blackMoves) {
    var possibleMoves = this.movement;

    if (this.color === "White") {
      whiteMoves.push(...possibleMoves);
    } else {
      blackMoves.push(...possibleMoves);
    }
  }
  updateKingPos(x, y, piece, color) {
    if (piece === "king") {
      if (color === "White") {
        whiteKingPos = { x: x, y: y };
      } else {
        blackKingPos = { x: x, y: y };
      }
    }
  }
}
//individual piece sub classes
class Queen extends Piece {
  constructor(color) {
    super(900, color, "queen", [], false);
    this.progress = 4;
  }
  updateMovement(pieceX, pieceY, board) {
    var movement = [];
    // up left
    for (let y = pieceY - 1; y > -1; y--) {
      if (board[y][pieceX + y - pieceY] == null) {
        movement.push({
          fromX: pieceX,
          fromY: pieceY,
          deltaX: y - pieceY,
          deltaY: y - pieceY,
        });
      } else if (board[y][pieceX + y - pieceY].color != this.color) {
        movement.push({
          fromX: pieceX,
          fromY: pieceY,
          deltaX: y - pieceY,
          deltaY: y - pieceY,
        });
        break;
      } else {
        break;
      }
    }
    //up right
    for (let y = pieceY - 1; y > -1; y--) {
      if (board[y][pieceX - y + pieceY] == null) {
        movement.push({
          fromX: pieceX,
          fromY: pieceY,
          deltaX: -y + pieceY,
          deltaY: y - pieceY,
        });
      } else if (board[y][pieceX - y + pieceY].color != this.color) {
        movement.push({
          fromX: pieceX,
          fromY: pieceY,
          deltaX: -y + pieceY,
          deltaY: y - pieceY,
        });
        break;
      } else {
        break;
      }
    }
    //down left
    for (let y = pieceY + 1; y < 8; y++) {
      if (board[y][pieceX - y + pieceY] == null) {
        movement.push({
          fromX: pieceX,
          fromY: pieceY,
          deltaX: -y + pieceY,
          deltaY: y - pieceY,
        });
      } else if (board[y][pieceX - y + pieceY].color != this.color) {
        movement.push({
          fromX: pieceX,
          fromY: pieceY,
          deltaX: -y + pieceY,
          deltaY: y - pieceY,
        });
        break;
      } else {
        break;
      }
    }
    //down right
    for (let y = pieceY + 1; y < 8; y++) {
      if (board[y][pieceX + y - pieceY] == null) {
        movement.push({
          fromX: pieceX,
          fromY: pieceY,
          deltaX: y - pieceY,
          deltaY: y - pieceY,
        });
      } else if (board[y][pieceX + y - pieceY].color != this.color) {
        movement.push({
          fromX: pieceX,
          fromY: pieceY,
          deltaX: y - pieceY,
          deltaY: y - pieceY,
        });
        break;
      } else {
        break;
      }
    }
    //up
    for (let y = pieceY - 1; y > -1; y--) {
      if (board[y][pieceX] == null) {
        movement.push({
          fromX: pieceX,
          fromY: pieceY,
          deltaX: 0,
          deltaY: y - pieceY,
        });
      } else if (board[y][pieceX].color != this.color) {
        movement.push({
          fromX: pieceX,
          fromY: pieceY,
          deltaX: 0,
          deltaY: y - pieceY,
        });
        break;
      } else {
        break;
      }
    }
    //down
    for (let y = pieceY + 1; y < 8; y++) {
      if (board[y][pieceX] == null) {
        movement.push({
          fromX: pieceX,
          fromY: pieceY,
          deltaX: 0,
          deltaY: y - pieceY,
        });
      } else if (board[y][pieceX].color != this.color) {
        movement.push({
          fromX: pieceX,
          fromY: pieceY,
          deltaX: 0,
          deltaY: y - pieceY,
        });
        break;
      } else {
        break;
      }
    }
    //left
    for (let x = pieceX - 1; x > -1; x--) {
      if (board[pieceY][x] == null) {
        movement.push({
          fromX: pieceX,
          fromY: pieceY,
          deltaX: x - pieceX,
          deltaY: 0,
        });
      } else if (board[pieceY][x].color != this.color) {
        movement.push({
          fromX: pieceX,
          fromY: pieceY,
          deltaX: x - pieceX,
          deltaY: 0,
        });
        break;
      } else {
        break;
      }
    }
    //right
    for (let x = pieceX + 1; x < 8; x++) {
      if (board[pieceY][x] == null) {
        movement.push({
          fromX: pieceX,
          fromY: pieceY,
          deltaX: x - pieceX,
          deltaY: 0,
        });
      } else if (board[pieceY][x].color != this.color) {
        movement.push({
          fromX: pieceX,
          fromY: pieceY,
          deltaX: x - pieceX,
          deltaY: 0,
        });
        break;
      } else {
        break;
      }
    }
    return movement;
  }
}

class Bishop extends Piece {
  constructor(color) {
    super(330, color, "bishop", [], false);
    this.progress = 1;
  }

  updateMovement(pieceX, pieceY, board) {
    var movement = [];
    //up left

    for (let y = pieceY - 1; y > -1; y--) {
      if (board[y][pieceX + y - pieceY] == null) {
        movement.push({
          fromX: pieceX,
          fromY: pieceY,
          deltaX: y - pieceY,
          deltaY: y - pieceY,
        });
      } else if (board[y][pieceX + y - pieceY].color != this.color) {
        movement.push({
          fromX: pieceX,
          fromY: pieceY,
          deltaX: y - pieceY,
          deltaY: y - pieceY,
        });
        break;
      } else {
        break;
      }
    }
    //up right
    for (let y = pieceY - 1; y > -1; y--) {
      if (board[y][pieceX - y + pieceY] == null) {
        movement.push({
          fromX: pieceX,
          fromY: pieceY,
          deltaX: -y + pieceY,
          deltaY: y - pieceY,
        });
      } else if (board[y][pieceX - y + pieceY].color != this.color) {
        movement.push({
          fromX: pieceX,
          fromY: pieceY,
          deltaX: -y + pieceY,
          deltaY: y - pieceY,
        });
        break;
      } else {
        break;
      }
    }
    //down left
    for (let y = pieceY + 1; y < 8; y++) {
      if (board[y][pieceX - y + pieceY] == null) {
        movement.push({
          fromX: pieceX,
          fromY: pieceY,
          deltaX: -y + pieceY,
          deltaY: y - pieceY,
        });
      } else if (board[y][pieceX - y + pieceY].color != this.color) {
        movement.push({
          fromX: pieceX,
          fromY: pieceY,
          deltaX: -y + pieceY,
          deltaY: y - pieceY,
        });
        break;
      } else {
        break;
      }
    }
    //down right
    for (let y = pieceY + 1; y < 8; y++) {
      if (board[y][pieceX + y - pieceY] == null) {
        movement.push({
          fromX: pieceX,
          fromY: pieceY,
          deltaX: y - pieceY,
          deltaY: y - pieceY,
        });
      } else if (board[y][pieceX + y - pieceY].color != this.color) {
        movement.push({
          fromX: pieceX,
          fromY: pieceY,
          deltaX: y - pieceY,
          deltaY: y - pieceY,
        });
        break;
      } else {
        break;
      }
    }
    return movement;
  }
}

class Rook extends Piece {
  constructor(color) {
    super(500, color, "rook", [], false);
    this.progress = 2;
  }
  //movement generation
  updateMovement(pieceX, pieceY, board) {
    var movement = [];
    //up
    for (let y = pieceY - 1; y > -1; y--) {
      if (board[y][pieceX] == null) {
        movement.push({
          fromX: pieceX,
          fromY: pieceY,
          deltaX: 0,
          deltaY: y - pieceY,
        });
      } else if (board[y][pieceX].color != this.color) {
        movement.push({
          fromX: pieceX,
          fromY: pieceY,
          deltaX: 0,
          deltaY: y - pieceY,
        });
        break;
      } else {
        break;
      }
    }
    //down
    for (let y = pieceY + 1; y < 8; y++) {
      if (board[y][pieceX] == null) {
        movement.push({
          fromX: pieceX,
          fromY: pieceY,
          deltaX: 0,
          deltaY: y - pieceY,
        });
      } else if (board[y][pieceX].color != this.color) {
        movement.push({
          fromX: pieceX,
          fromY: pieceY,
          deltaX: 0,
          deltaY: y - pieceY,
        });
        break;
      } else {
        break;
      }
    }
    //left
    for (let x = pieceX - 1; x > -1; x--) {
      if (board[pieceY][x] == null) {
        movement.push({
          fromX: pieceX,
          fromY: pieceY,
          deltaX: x - pieceX,
          deltaY: 0,
        });
      } else if (board[pieceY][x].color != this.color) {
        movement.push({
          fromX: pieceX,
          fromY: pieceY,
          deltaX: x - pieceX,
          deltaY: 0,
        });
        break;
      } else {
        break;
      }
    }
    //right
    for (let x = pieceX + 1; x < 8; x++) {
      if (board[pieceY][x] == null) {
        movement.push({
          fromX: pieceX,
          fromY: pieceY,
          deltaX: x - pieceX,
          deltaY: 0,
        });
      } else if (board[pieceY][x].color != this.color) {
        movement.push({
          fromX: pieceX,
          fromY: pieceY,
          deltaX: x - pieceX,
          deltaY: 0,
        });
        break;
      } else {
        break;
      }
    }
    return movement;
  }
}

class Knight extends Piece {
  constructor(color) {
    super(320, color, "knight", [], false);
    this.gameProgress = 1;
  }
  updateMovement(pieceX, pieceY) {
    var movement = [
      { fromX: pieceX, fromY: pieceY, deltaX: -1, deltaY: -2 },
      { fromX: pieceX, fromY: pieceY, deltaX: 1, deltaY: -2 },
      { fromX: pieceX, fromY: pieceY, deltaX: -1, deltaY: 2 },
      { fromX: pieceX, fromY: pieceY, deltaX: 1, deltaY: 2 },
      { fromX: pieceX, fromY: pieceY, deltaX: -2, deltaY: -1 },
      { fromX: pieceX, fromY: pieceY, deltaX: -2, deltaY: 1 },
      { fromX: pieceX, fromY: pieceY, deltaX: 2, deltaY: -1 },
      { fromX: pieceX, fromY: pieceY, deltaX: 2, deltaY: 1 },
    ];
    return movement;
  }
}

class King extends Piece {
  constructor(color) {
    super(10000000, color, "king", [], false);
  }
  updateMovement(pieceX, pieceY) {
    var movement = [];
    movement.push(
      { fromX: pieceX, fromY: pieceY, deltaX: 1, deltaY: 1 },
      { fromX: pieceX, fromY: pieceY, deltaX: 1, deltaY: 0 },
      { fromX: pieceX, fromY: pieceY, deltaX: 1, deltaY: -1 },
      { fromX: pieceX, fromY: pieceY, deltaX: 0, deltaY: -1 },
      { fromX: pieceX, fromY: pieceY, deltaX: -1, deltaY: -1 },
      { fromX: pieceX, fromY: pieceY, deltaX: -1, deltaY: 0 },
      { fromX: pieceX, fromY: pieceY, deltaX: -1, deltaY: 1 },
      { fromX: pieceX, fromY: pieceY, deltaX: 0, deltaY: 1 }
    );
    if (this.color === "White") {
      if (
        castleCheck(
          whiteVision,
          blackVision,
          whiteKingPos,
          blackKingPos,
          boardPieces,
          "White",
          "Right"
        )
      ) {
        movement.push({
          fromX: pieceX,
          fromY: pieceY,
          deltaX: 2,
          deltaY: 0,
          special: { type: "castle", xOffset: 1, side: "Right" },
        });
      }
      if (
        castleCheck(
          whiteVision,
          blackVision,
          whiteKingPos,
          blackKingPos,
          boardPieces,
          "White",
          "Left"
        )
      ) {
        movement.push({
          fromX: pieceX,
          fromY: pieceY,
          deltaX: -2,
          deltaY: 0,
          special: { type: "castle", xOffset: -1, side: "Left" },
        });
      }
    }
    if (this.color === "Black") {
      if (
        castleCheck(
          whiteVision,
          blackVision,
          whiteKingPos,
          blackKingPos,
          boardPieces,
          "Black",
          "Right"
        )
      ) {
        movement.push({
          fromX: pieceX,
          fromY: pieceY,
          deltaX: 2,
          deltaY: 0,
          special: { type: "castle", xOffset: 1, side: "Right" },
        });
      }
      if (
        castleCheck(
          whiteVision,
          blackVision,
          whiteKingPos,
          blackKingPos,
          boardPieces,
          "Black",
          "Left"
        )
      ) {
        movement.push({
          fromX: pieceX,
          fromY: pieceY,
          deltaX: -2,
          deltaY: 0,
          special: { type: "castle", xOffset: -1, side: "Left" },
        });
      }
    }
    return movement;
  }
}

class Pawn extends Piece {
  constructor(color) {
    super(100, color, "pawn", [], false);
    this.qualified = false;
  }
  updateMovement(pieceX, pieceY, board) {
    var movement = [];
    if (this.color === "White") {
      if (pieceY - 1 > -1 && board[pieceY - 1][pieceX] === null) {
        if (pieceY === 1) {
          for (let i = 0; i < 4; i++) {
            movement.push({
              fromX: pieceX,
              fromY: pieceY,
              deltaX: 0,
              deltaY: -1,
              special: { type: "promotion", piece: "qrnb"[i] },
            });
          }
        } else {
          movement.push({
            fromX: pieceX,
            fromY: pieceY,
            deltaX: 0,
            deltaY: -1,
          });
        }
        if (
          this.moved === false &&
          pieceY - 2 > -1 &&
          board[pieceY - 2][pieceX] === null
        ) {
          movement.push({
            fromX: pieceX,
            fromY: pieceY,
            deltaX: 0,
            deltaY: -2,
          });
        }
      }
      for (let o = 0; o < 3; o = o + 2) {
        if (
          isInBoard(pieceX - 1 + o, pieceY - 1) &&
          board[pieceY - 1][pieceX - 1 + o]
        ) {
          if (pieceY === 1) {
            for (let i = 0; i < 4; i++) {
              movement.push({
                fromX: pieceX,
                fromY: pieceY,
                deltaX: -1 + o,
                deltaY: -1,
                special: { type: "promotion", piece: "qrnb"[i] },
              });
            }
          } else {
            movement.push({
              fromX: pieceX,
              fromY: pieceY,
              deltaX: -1 + o,
              deltaY: -1,
            });
          }
        }
      }
    } else if (this.color === "Black") {
      if (pieceY + 1 < 8 && board[pieceY + 1][pieceX] === null) {
        if (pieceY === 6) {
          for (let i = 0; i < 4; i++) {
            movement.push({
              fromX: pieceX,
              fromY: pieceY,
              deltaX: 0,
              deltaY: 1,
              special: { type: "promotion", piece: "qrnb"[i] },
            });
          }
        } else {
          movement.push({
            fromX: pieceX,
            fromY: pieceY,
            deltaX: 0,
            deltaY: 1,
          });
        }
        if (
          this.moved === false &&
          pieceY + 2 < 8 &&
          board[pieceY + 2][pieceX] === null
        ) {
          movement.push({
            fromX: pieceX,
            fromY: pieceY,
            deltaX: 0,
            deltaY: 2,
          });
        }
      }
      for (let o = 0; o < 3; o = o + 2) {
        if (
          isInBoard(pieceX - 1 + o, pieceY + 1) &&
          board[pieceY + 1][pieceX - 1 + o]
        ) {
          if (pieceY === 6) {
            for (let i = 0; i < 4; i++) {
              movement.push({
                fromX: pieceX,
                fromY: pieceY,
                deltaX: -1 + o,
                deltaY: 1,
                special: { type: "promotion", piece: "qrnb"[i] },
              });
            }
          } else {
            movement.push({
              fromX: pieceX,
              fromY: pieceY,
              deltaX: -1 + o,
              deltaY: 1,
            });
          }
        }
      }
    }
    //en passant

    if (this.color === "White") {
      if (enPassantCheck(board, "White", "Right", pieceX, pieceY)) {
        movement.push({
          fromX: pieceX,
          fromY: pieceY,
          deltaX: 1,
          deltaY: -1,
          special: { type: "enPassant", yOffset: 1 },
        });
      } else if (enPassantCheck(board, "White", "Left", pieceX, pieceY)) {
        movement.push({
          fromX: pieceX,
          fromY: pieceY,
          deltaX: -1,
          deltaY: -1,
          special: { type: "enPassant", yOffset: 1 },
        });
      }
    } else {
      if (enPassantCheck(board, "Black", "Right", pieceX, pieceY)) {
        movement.push({
          fromX: pieceX,
          fromY: pieceY,
          deltaX: 1,
          deltaY: 1,
          special: { type: "enPassant", yOffset: -1 },
        });
      } else if (enPassantCheck(board, "Black", "Left", pieceX, pieceY)) {
        movement.push({
          fromX: pieceX,
          fromY: pieceY,
          deltaX: -1,
          deltaY: 1,
          special: { type: "enPassant", yOffset: -1 },
        });
      }
    }
    return movement;
  }
}

function convertPieceToCharWithColor(piece, color) {
  if (color === "White") {
    return {
      pawn: "p",
      knight: "n",
      king: "k",
      rook: "r",
      queen: "q",
      bishop: "b",
    }[piece.type];
  } else {
    return {
      pawn: "P",
      knight: "N",
      king: "K",
      rook: "R",
      queen: "Q",
      bishop: "B",
    }[piece.type];
  }
}

function convertCharToClassWithColor(char, color) {
  return {
    x: null,
    p: new Pawn(color),
    n: new Knight(color),
    k: new King(color),
    r: new Rook(color),
    q: new Queen(color),
    b: new Bishop(color),
  }[char.toLowerCase()];
}

function convertCharToClass(char) {
  let color = /^[A-Z]$/.test(char) ? "Black" : "White";
  return {
    x: null,
    p: new Pawn(color),
    n: new Knight(color),
    k: new King(color),
    r: new Rook(color),
    q: new Queen(color),
    b: new Bishop(color),
  }[char.toLowerCase()];
}

function convertCharToNum(char) {
  const colorNum = /^[A-Z]$/.test(char) ? 1 : 0;

  return {
    x: 12,
    p: 0 + colorNum,
    n: 2 + colorNum,
    b: 4 + colorNum,
    r: 6 + colorNum,
    q: 8 + colorNum,
    k: 10 + colorNum,
  }[char.toLowerCase()];
}

function generateBoardFromDescription(board_description, convertFunction) {
  board_description = board_description.trim();
  let ret = [];

  for (const row of board_description.split("\n")) {
    ret.push(row.split("").map(convertFunction));
  }

  return ret;
}

function bitstringToBoardDraw(bitstring, lperspective) {
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      if (
        lastMoveHistory[historyNum - 1] &&
        ((lastMoveHistory[historyNum - 1].from.x === x &&
          lastMoveHistory[historyNum - 1].from.y === y &&
          lperspective) ||
          (lastMoveHistory[historyNum - 1].from.x === 7 - x &&
            lastMoveHistory[historyNum - 1].from.y === 7 - y &&
            !lperspective))
      ) {
        fill(lastMoveFromColor);
      } else if (
        lastMoveHistory[historyNum - 1] &&
        ((lastMoveHistory[historyNum - 1].to.x === x &&
          lastMoveHistory[historyNum - 1].to.y === y &&
          lperspective) ||
          (lastMoveHistory[historyNum - 1].to.x === 7 - x &&
            lastMoveHistory[historyNum - 1].to.y === 7 - y &&
            !lperspective))
      ) {
        fill(lastMoveToColor);
      } else if (
        y === floor(mouseY / squareSize) &&
        x === floor(mouseX / squareSize) &&
        isInBoard(floor(mouseY / squareSize), mouseX / squareSize)
      ) {
        fill(hoverColor);
      } else {
        if ((y + x) % 2 === 0) {
          fill(lightTileColor);
        } else {
          fill(darkTileColor);
        }
      }
      rect(squareSize * x, squareSize * y, squareSize, squareSize);

      if ((y + x) % 2 === 1) {
        fill(lightTileColor);
      } else {
        fill(darkTileColor);
      }

      textSize((11 / 50) * squareSize);
      if (lperspective && x === 7) {
        text(8 - y, (392 / 50) * squareSize, (y + 0.25) * squareSize);
      } else if (!lperspective && x === 7) {
        text(y + 1, (392 / 50) * squareSize, (y + 0.25) * squareSize);
      }
      if (lperspective && y === 7) {
        text(letterize(x), (x + 0.05) * squareSize, (397 / 50) * squareSize);
      } else if (!lperspective && y === 7) {
        text(
          letterize(7 - x),
          (x + 0.05) * squareSize,
          (397 / 50) * squareSize
        );
      }
      if (lperspective) {
        if (bitstring[9 * y + x] != "x") {
          let drawImage = {
            b: wb,
            n: wn,
            k: wk,
            q: wq,
            r: wr,
            p: wp,
            B: bb,
            N: bn,
            K: bk,
            Q: bq,
            R: br,
            P: bp,
          }[bitstring[9 * y + x]];
          if (
            bitstring[9 * y + x] === "P" ||
            bitstring[9 * y + x] === "p" ||
            bitstring[9 * y + x] === "r" ||
            bitstring[9 * y + x] === "R"
          ) {
            image(
              drawImage,
              squareSize * x + pieceSize - 2,
              squareSize * y + pieceSize,
              squareSize - pieceSize * 2,
              squareSize - pieceSize * 2
            );
          } else {
            image(
              drawImage,
              squareSize * x + pieceSize,
              squareSize * y + pieceSize,
              squareSize - pieceSize * 2,
              squareSize - pieceSize * 2
            );
          }
        }
      } else {
        if (bitstring[70 - y * 9 - x] != "x") {
          let drawImage = {
            b: wb,
            n: wn,
            k: wk,
            q: wq,
            r: wr,
            p: wp,
            B: bb,
            N: bn,
            K: bk,
            Q: bq,
            R: br,
            P: bp,
          }[bitstring[70 - y * 9 - x]];
          if (
            bitstring[70 - y * 9 - x] === "P" ||
            bitstring[70 - y * 9 - x] === "p" ||
            bitstring[70 - y * 9 - x] === "r" ||
            bitstring[70 - y * 9 - x] === "R"
          ) {
            image(
              drawImage,
              squareSize * x + pieceSize - 2,
              squareSize * y + pieceSize,
              squareSize - pieceSize * 2,
              squareSize - pieceSize * 2
            );
          } else {
            image(
              drawImage,
              squareSize * x + pieceSize,
              squareSize * y + pieceSize,
              squareSize - pieceSize * 2,
              squareSize - pieceSize * 2
            );
          }
        }
      }

      if (
        checkHistory[historyNum] &&
        ((x === checkHistory[historyNum].x &&
          y === checkHistory[historyNum].y &&
          lperspective) ||
          (7 - x === checkHistory[historyNum].x &&
            7 - y === checkHistory[historyNum].y &&
            !lperspective))
      ) {
        fill(checkColor);
        ellipse(
          x * squareSize + squareSize / 2,
          y * squareSize + squareSize / 2,
          (2 / 3) * squareSize,
          (2 / 3) * squareSize
        );
      }
    }
  }
}

function hover() {
  let hover = { x: floor(mouseX / squareSize), y: floor(mouseY / squareSize) };
  if (isInBoard(hover.x, hover.y)) {
    fill(hoverColor);
    rect(hover.x * squareSize, hover.y * squareSize, squareSize, squareSize);
  }
}

function board(lperspective) {
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      if ((y + x) % 2 === 0) {
        fill(lightTileColor);
      } else {
        fill(darkTileColor);
      }

      if (
        (lastMove &&
          lastMove.from.x === 7 - x &&
          lastMove.from.y === 7 - y &&
          !lperspective) ||
        (lastMove &&
          lastMove.from.x === x &&
          lastMove.from.y === y &&
          lperspective)
      ) {
        fill(lastMoveFromColor);
      } else if (
        (lastMove &&
          lastMove.to.x === 7 - x &&
          lastMove.to.y === 7 - y &&
          !lperspective) ||
        (lastMove && lastMove.to.x === x && lastMove.to.y === y && lperspective)
      ) {
        fill(lastMoveToColor);
      }

      if (
        selectedPiece &&
        gameState === 1 &&
        ((selectedPieceCoords.x === x &&
          selectedPieceCoords.y === y &&
          lperspective) ||
          (selectedPieceCoords.x === 7 - x &&
            selectedPieceCoords.y === 7 - y &&
            !lperspective))
      ) {
        fill(selectColor);
      }

      rect(squareSize * x, squareSize * y, squareSize, squareSize);

      if ((y + x) % 2 === 1) {
        fill(lightTileColor);
      } else {
        fill(darkTileColor);
      }
      textSize((11 / 50) * squareSize);
      if (lperspective && x === 7) {
        text(8 - y, (392 / 50) * squareSize, (y + 0.25) * squareSize);
      } else if (!lperspective && x === 7) {
        text(y + 1, (392 / 50) * squareSize, (y + 0.25) * squareSize);
      }
      if (lperspective && y === 7) {
        text(letterize(x), (x + 0.05) * squareSize, (397 / 50) * squareSize);
      } else if (!lperspective && y === 7) {
        text(
          letterize(7 - x),
          (x + 0.05) * squareSize,
          (397 / 50) * squareSize
        );
      }
    }
  }
}

function movesUpdate(
  board,
  color1,
  whiteMoves,
  blackMoves,
  whiteVision,
  blackVision
) {
  whiteMoves = [];
  blackMoves = [];
  whiteVision = [];
  blackVision = [];
  // update everything for pieces so they always know their stuff
  var piece;
  for (let x = 0; x < 8; x++) {
    for (let y = 0; y < 8; y++) {
      piece = board[y][x];
      if (piece != null && piece.type === "pawn") {
        piece.updateEnPassant();
      }
    }
  }
  for (let x = 0; x < 8; x++) {
    for (let y = 0; y < 8; y++) {
      piece = board[y][x];
      if (piece) {
        piece.movement = piece.updateMovement(x, y, board);

        piece.updateVision(x, y, whiteVision, blackVision);
        piece.updateKingPos(x, y, piece.type, piece.color);
      }
    }
  }
  for (let x = 0; x < 8; x++) {
    for (let y = 0; y < 8; y++) {
      piece = board[y][x];
      if (piece != null) {
        piece.checkMovement(
          whiteVision,
          blackVision,
          whiteKingPos,
          blackKingPos,
          color1,
          board
        );
        piece.updateMoves(x, y, whiteMoves, blackMoves);
      }
    }
  }
  return [
    color1 === "White" ? whiteMoves : blackMoves,
    color1 === "White" ? blackVision : whiteVision,
  ];
}

function pieceUpdates(
  board,
  color,
  whiteMoves,
  blackMoves,
  whitePieces,
  blackPieces,
  whiteVision,
  blackVision
) {
  whiteMoves = [];
  blackMoves = [];
  // 0 pawn, 1 knight, 2 bishop, 3 rook, 4 queen
  whitePieces = [0, 0, 0, 0, 0];
  blackPieces = [0, 0, 0, 0, 0];
  whiteVision = [];
  blackVision = [];
  // update everything for pieces so they always know their stuff
  for (let x = 0; x < 8; x++) {
    for (let y = 0; y < 8; y++) {
      let piece = board[y][x];
      if (piece != null) {
        if (piece.type === "pawn") {
          piece.updateEnPassant();
        }
      }
    }
  }
  for (let x = 0; x < 8; x++) {
    for (let y = 0; y < 8; y++) {
      let piece = board[y][x];
      if (piece != null) {
        piece.movement = piece.updateMovement(x, y, board);
        piece.updateVision(x, y, whiteVision, blackVision);

        if (piece.color === "White") {
          if (piece.type === "pawn") {
            whitePieces[0]++;
          } else if (piece.type === "knight") {
            whitePieces[1]++;
          } else if (piece.type === "bishop") {
            whitePieces[2]++;
          } else if (piece.type === "rook") {
            whitePieces[3]++;
          } else if (piece.type === "queen") {
            whitePieces[4]++;
          }
        } else {
          if (piece.type === "pawn") {
            blackPieces[0]++;
          } else if (piece.type === "knight") {
            blackPieces[1]++;
          } else if (piece.type === "bishop") {
            blackPieces[2]++;
          } else if (piece.type === "rook") {
            blackPieces[3]++;
          } else if (piece.type === "queen") {
            blackPieces[4]++;
          }
        }
        piece.updateKingPos(x, y, piece.type, piece.color);
      }
    }
  }
  for (let x = 0; x < 8; x++) {
    for (let y = 0; y < 8; y++) {
      let piece = board[y][x];
      if (piece != null) {
        if (piece.color === color) {
          piece.checkMovement(
            whiteVision,
            blackVision,
            whiteKingPos,
            blackKingPos,
            color,
            board
          );
        }
        piece.updateMoves(x, y, whiteMoves, blackMoves);
      }
    }
  }

  return [
    whiteMoves,
    blackMoves,
    whitePieces,
    blackPieces,
    whiteVision,
    blackVision,
  ];
}

function gameEndCalls() {
  gameState = 0;
  if (switchThingForHistoryNum === false) {
    historyNum = turnNumber;
    switchThingForHistoryNum = true;
  }
}

function pieceGeneration(perspective) {
  for (let x = 0; x < 8; x++) {
    for (let y = 0; y < 8; y++) {
      var piece;
      if (perspective) {
        piece = boardPieces[y][x];
      } else {
        piece = boardPieces[7 - y][7 - x];
      }

      if (piece != null) {
        if (piece.type === "pawn" || piece.type === "rook") {
          image(
            piece.image,
            squareSize * x + pieceSize - 2,
            squareSize * y + pieceSize,
            squareSize - pieceSize * 2,
            squareSize - pieceSize * 2
          );
        } else {
          image(
            piece.image,
            squareSize * x + pieceSize,
            squareSize * y + pieceSize,
            squareSize - pieceSize * 2,
            squareSize - pieceSize * 2
          );
        }
      }
    }
  }
}

var whiteNum = -1;
var blackNum = 4;

var whiteDisplayText = "Player";
var blackDisplayText = "Bot Level 5";

var botSpeedMiliseconds = 500;

let startButton,
  rematchButton,
  resignButton,
  whitePButton,
  blackPButton,
  addButton,
  minButton,
  addaddButton,
  minminButton,
  sizeSlider;

function sideBoardStatic() {
  fill(225);
  rect(8 * squareSize, 0, 6 * squareSize, 8 * squareSize);
  fill(0);
  textSize((squareSize / 50) * 17);
  text("Settings and Stuff", 9.8 * squareSize, 0.5 * squareSize);

  startButton = createButton("Start Game");
  startButton.position(8.6 * squareSize, 1.4 * squareSize);
  startButton.mousePressed(startGame);
  rematchButton = createButton("Play Again");
  rematchButton.position(8.6 * squareSize, 2 * squareSize);
  rematchButton.mousePressed(resetGame);
  resignButton = createButton("End Game");
  resignButton.position(8.6 * squareSize, 2.6 * squareSize);
  resignButton.mousePressed(resignCall);
  whitePButton = createButton("White Player:");
  whitePButton.position(8.6 * squareSize, 4.2 * squareSize);
  whitePButton.mousePressed(whiteSwitch);
  blackPButton = createButton("Black Player:");
  blackPButton.position(8.6 * squareSize, 5.4 * squareSize);
  blackPButton.mousePressed(blackSwitch);
  textSize((squareSize / 50) * 15);
  text(whiteDisplayText, 8.6 * squareSize, 5 * squareSize);
  text(blackDisplayText, 8.6 * squareSize, 6.2 * squareSize);
  textSize((squareSize / 50) * 11);
  text(
    "Can't be changed during the game:",
    8.5 * squareSize,
    3.3 * squareSize,
    2.3 * squareSize,
    3.4 * squareSize
  );
  textSize((squareSize / 50) * 11);
  text(
    "Minimum time for bots to move (ms):",
    8.4 * squareSize,
    6.6 * squareSize,
    2.3 * squareSize,
    3.4 * squareSize
  );
  textSize((squareSize / 50) * 10);
  text(JSON.stringify(botSpeedMiliseconds), 9.2 * squareSize, 7.5 * squareSize);
  addButton = createButton("+");
  addButton.position(9.85 * squareSize, 7.3 * squareSize);
  addButton.mousePressed(add);
  minButton = createButton("-");
  minButton.position(8.7 * squareSize, 7.3 * squareSize);
  minButton.mousePressed(sub);
  addaddButton = createButton("++");
  addaddButton.position(10.35 * squareSize, 7.3 * squareSize);
  addaddButton.mousePressed(addadd);
  minminButton = createButton("--");
  minminButton.position(8.2 * squareSize, 7.3 * squareSize);
  minminButton.mousePressed(subsub);
  textSize((squareSize / 50) * 9);
  text(
    "Square Size(px): " + JSON.stringify(squareSize),
    8.7 * squareSize,
    0.9 * squareSize
  );
  sizeSlider = createSlider(40, squareSize, squareSize, 1);
  sizeSlider.position(8.6 * squareSize, squareSize);
  textSize((squareSize / 50) * 12);
  text(
    "Promotion takes input from keys being typed after clicking on the display. q = queen, n = knight, b = bishop, r = rook",
    11 * squareSize,
    0.9 * squareSize,
    3 * squareSize,
    10 * squareSize
  );
  text(
    "Please email me at harqian@nuevaschool.org if you find any bugs",
    11 * squareSize,
    2.6 * squareSize,
    3 * squareSize,
    10 * squareSize
  );
}

function addadd() {
  botSpeedMiliseconds = botSpeedMiliseconds + 1000;
  if (botSpeedMiliseconds > 9900) {
    botSpeedMiliseconds = 9900;
  }
  fill(225);
  rect(9.2 * squareSize, 7.2 * squareSize, squareSize / 2, squareSize / 3);
  fill(0);
  textSize((squareSize / 50) * 11);
  text(JSON.stringify(botSpeedMiliseconds), 9.2 * squareSize, 7.5 * squareSize);
}

function subsub() {
  botSpeedMiliseconds = botSpeedMiliseconds - 1000;
  if (botSpeedMiliseconds < 0) {
    botSpeedMiliseconds = 0;
  }

  fill(225);
  rect(9.2 * squareSize, 7.2 * squareSize, squareSize / 2, squareSize / 3);
  fill(0);
  textSize((squareSize / 50) * 11);
  text(JSON.stringify(botSpeedMiliseconds), 9.2 * squareSize, 7.5 * squareSize);
}

function add() {
  botSpeedMiliseconds = botSpeedMiliseconds + 100;
  if (botSpeedMiliseconds > 9900) {
    botSpeedMiliseconds = 9900;
  }
  fill(225);
  rect(9.2 * squareSize, 7.2 * squareSize, squareSize / 2, squareSize / 3);
  fill(0);
  textSize((squareSize / 50) * 11);
  text(JSON.stringify(botSpeedMiliseconds), 9.2 * squareSize, 7.5 * squareSize);
}

function sub() {
  botSpeedMiliseconds = botSpeedMiliseconds - 100;
  if (botSpeedMiliseconds < 0) {
    botSpeedMiliseconds = botSpeedMiliseconds + 100;
  }
  fill(225);
  rect(9.2 * squareSize, 7.2 * squareSize, squareSize / 2, squareSize / 3);
  fill(0);
  textSize((squareSize / 50) * 11);
  text(JSON.stringify(botSpeedMiliseconds), 9.2 * squareSize, 7.5 * squareSize);
}

function displayText() {
  fill(225);
  rect(8.1 * squareSize, 4.2 * squareSize, 2.5 * squareSize, squareSize);
  rect(8.1 * squareSize, 5.9 * squareSize, 2.5 * squareSize, 0.5 * squareSize);
  fill(0);
  textSize((squareSize / 50) * 15);
  text(whiteDisplayText, 8.6 * squareSize, 5 * squareSize);
  text(blackDisplayText, 8.6 * squareSize, 6.2 * squareSize);
}

function blackSwitch() {
  if (gameState === 0 || gameState === 2) {
    blackNum++;
    if (blackNum > 4) {
      blackNum = -1;
    }
    if (blackNum === -1) {
      blackDisplayText = "Player";
    } else {
      blackDisplayText = "Bot Level " + JSON.stringify(blackNum + 1);
    }
    displayText();
  }
}

function whiteSwitch() {
  if (gameState === 0 || gameState === 2) {
    whiteNum++;
    if (whiteNum > 4) {
      whiteNum = -1;
    }
    if (whiteNum === -1) {
      whiteDisplayText = "Player";
    } else {
      whiteDisplayText = "Bot Level " + JSON.stringify(whiteNum + 1);
    }
    displayText();
  }
}

function startGame() {
  if (whiteNum === -1) {
    whiteBotOn = false;
  } else {
    whiteBotOn = true;
    whiteBotStrength = whiteNum;
  }
  if (blackNum === -1) {
    blackBotOn = false;
  } else {
    blackBotOn = true;
    blackBotStrength = blackNum;
  }
  if (whiteBotOn && !blackBotOn) {
    dperspective = false;
  } else if (!whiteBotOn && blackBotOn) {
    dperspective = true;
  } else {
    dperspecitve = true;
  }
  gameState = 1;
  startButton.remove();
  chessSounds.play(0, 1, 1, 0.6, 0.4);
}

function resetGame() {
  if (gameState === 0) {
    chessSounds.play(0, 1, 1, 0.6, 0.4);
    whiteMoves = [];
    blackMoves = [];
    // 0 pawn, 1 knight, 2 bishop, 3 rook, 4 queen
    whitePieces = [0, 0, 0, 0, 0];
    blackPieces = [0, 0, 0, 0, 0];
    whiteVision = [];
    blackVision = [];
    whiteKingPos = { x: 4, y: 7 };
    blackKingPos = { x: 4, y: 0 };
    lastMove = null;
    special = null;
    selectedPiece = null;
    selectedPieceCoords = null;
    promotionPiece = "q";
    showSign = 0;
    gameState = 0;
    turn = "White";
    turnNumber = 0;
    bitstringHistory = [
      "RNBQKBNR/PPPPPPPP/xxxxxxxx/xxxxxxxx/xxxxxxxx/xxxxxxxx/pppppppp/rnbqkbnr/",
    ];
    historyNum = 0;
    boardHistory = [];
    lastMoveHistory = [];
    checkHistory = [];
    bitstringCount = {};
    isThreeFolded = false;
    isResigned = false;
    switchThingForHistoryNum = false;
    boardPieces = generateBoardFromDescription(
      board_description,
      convertCharToClass
    );
    var infoArr = pieceUpdates(boardPieces, "White");
    whiteMoves = infoArr[0];
    blackMoves = infoArr[1];
    whitePieces = infoArr[2];
    blackPieces = infoArr[3];
    whiteVision = infoArr[4];
    blackVision = infoArr[5];
    if (whiteNum === -1) {
      whiteBotOn = false;
    } else {
      whiteBotOn = true;
      whiteBotStrength = whiteNum;
    }
    if (blackNum === -1) {
      blackBotOn = false;
    } else {
      blackBotOn = true;
      blackBotStrength = blackNum;
    }
    if (whiteBotOn && !blackBotOn) {
      dperspective = false;
    } else if (!whiteBotOn && blackBotOn) {
      dperspective = true;
    } else {
      dperspecitve = true;
    }
    gameState = 1;
  }
}

function resignCall() {
  if (gameState === 1){
    isResigned = true;
    showSign = 1;
    chessSounds.play(0, 1, 1, 10.2, 0.4);
  }
  
  
}

//detect if click is in a square, lots of captuing and moving stuff
function mousePressed() {

  let clickCoords = {
    x: floor(mouseX / squareSize),
    y: floor(mouseY / squareSize),
  };

  // idk why we need to specify != null here normally just nothing works fine
  if (isInBoard(clickCoords.x, clickCoords.y)) {
    if (showSign === 1) {
      showSign = 0;
    } else if (showSign === 0) {
      showSign = 1;
    }
  }
  if (dperspective) {
    if (
      clickCoords &&
      isInBoard(clickCoords.x, clickCoords.y) &&
      boardPieces[clickCoords.y][clickCoords.x] != null &&
      turnCheck(boardPieces[clickCoords.y][clickCoords.x]) &&
      ((boardPieces[clickCoords.y][clickCoords.x].color === "White" &&
        !whiteBotOn) ||
        (boardPieces[clickCoords.y][clickCoords.x].color === "Black" &&
          !blackBotOn)) &&
      gameState === 1
    ) {
      if (
        selectedPieceCoords != null &&
        selectedPieceCoords.x === clickCoords.x &&
        selectedPieceCoords.y === clickCoords.y
      ) {
        selectedPieceCoords = null;
        selectedPiece = null;
      } else {
        selectedPieceCoords = { x: clickCoords.x, y: clickCoords.y };
        selectedPiece =
          boardPieces[selectedPieceCoords.y][selectedPieceCoords.x];
      }
    }
    if (
      selectedPiece != null &&
      selectedPieceCoords != null &&
      selectedPiece.isClickableMove(
        selectedPieceCoords.x,
        selectedPieceCoords.y,
        clickCoords.x,
        clickCoords.y
      )
    ) {
      if (special && special.type === "promotion") {
        moveOnBoard(selectedPieceCoords, clickCoords, special, promotionPiece);
      } else {
        moveOnBoard(selectedPieceCoords, clickCoords, special);
      }

      clickCoords = null;
      selectedPiece = null;
      selectedPieceCoords = null;
      showSign = 1;
    }
  } else {
    var inverseClickCoords = { x: 7 - clickCoords.x, y: 7 - clickCoords.y };
    if (
      inverseClickCoords &&
      isInBoard(inverseClickCoords.x, inverseClickCoords.y) &&
      boardPieces[inverseClickCoords.y][inverseClickCoords.x] != null &&
      turnCheck(boardPieces[inverseClickCoords.y][inverseClickCoords.x]) &&
      ((boardPieces[inverseClickCoords.y][inverseClickCoords.x].color ===
        "White" &&
        !whiteBotOn) ||
        (boardPieces[inverseClickCoords.y][inverseClickCoords.x].color ===
          "Black" &&
          !blackBotOn)) &&
      gameState === 1
    ) {
      if (
        selectedPieceCoords != null &&
        selectedPieceCoords.x === inverseClickCoords.x &&
        selectedPieceCoords.y === inverseClickCoords.y
      ) {
        selectedPieceCoords = null;
        selectedPiece = null;
      } else {
        selectedPieceCoords = {
          x: inverseClickCoords.x,
          y: inverseClickCoords.y,
        };
        selectedPiece = boardPieces[inverseClickCoords.y][inverseClickCoords.x];
      }
    }
    if (
      selectedPiece != null &&
      selectedPieceCoords != null &&
      selectedPiece.isClickableMove(
        selectedPieceCoords.x,
        selectedPieceCoords.y,
        inverseClickCoords.x,
        inverseClickCoords.y
      )
    ) {
      var inverseSelectedPieceCoords = {
        x: 7 - selectedPieceCoords.x,
        y: 7 - selectedPieceCoords.y,
      };
      if (special && special.type === "promotion") {
        moveOnBoard(
          selectedPieceCoords,
          inverseClickCoords,
          special,
          promotionPiece
        );
      } else {
        moveOnBoard(selectedPieceCoords, inverseClickCoords, special);
      }

      clickCoords = null;
      selectedPiece = null;
      selectedPieceCoords = null;
      showSign = 1;
    }
  }
}

//testing
function keyPressed() {
  if (keyCode === LEFT_ARROW && gameState === 0 && historyNum > 0) {
    historyNum--;
  } else if (
    keyCode === RIGHT_ARROW &&
    gameState === 0 &&
    historyNum < turnNumber
  ) {
    historyNum++;
  }
}

function keyTyped() {
  if (key === "q" || key === "r" || key === "n" || key === "b") {
    promotionPiece = key;
  }
}

function preload() {
  boardPieces = generateBoardFromDescription(
    board_description,
    convertCharToClass
  );
  bitstringHistory.push(boardToBitstring(boardPieces))
  //proxyBoard = generateBoardFromDescription(board_description, convertCharToNum)
}

function setup() {
  createCanvas(14 * squareSize, 8 * squareSize);
  sideBoardStatic();
  noStroke();
  board(true);
  pieceGeneration(dperspective);
  var infoArr = pieceUpdates(boardPieces, "White");
  whiteMoves = infoArr[0];
  blackMoves = infoArr[1];
  whitePieces = infoArr[2];
  blackPieces = infoArr[3];
  whiteVision = infoArr[4];
  blackVision = infoArr[5];
  if (whiteBotOn || blackBotOn) {
    botsMakeMoves();
  }
  wb = loadImage("chess piece images/bishopWhite.png");
  wn = loadImage("chess piece images/knightWhite.png");
  wk = loadImage("chess piece images/kingWhite.png");
  wq = loadImage("chess piece images/queenWhite.png");
  wr = loadImage("chess piece images/rookWhite.png");
  wp = loadImage("chess piece images/pawnWhite.png");
  bb = loadImage("chess piece images/bishopBlack.png");
  bn = loadImage("chess piece images/knightBlack.png");
  bk = loadImage("chess piece images/kingBlack.png");
  bq = loadImage("chess piece images/queenBlack.png");
  br = loadImage("chess piece images/rookBlack.png");
  bp = loadImage("chess piece images/pawnBlack.png");
  chessSounds = loadSound("chessSounds.mp3");
  
}

function draw() {
  tempSquareSize = sizeSlider.value();
  if (mouseIsPressed === false && tempSquareSize != squareSize) {
    fill(255);
    rect(0, 0, 14 * squareSize, 8 * squareSize);
    squareSize = tempSquareSize;
    pieceSize = squareSize;
    board(dperspective);
    hover();
    pieceGeneration(dperspective);

    fill(225);
    rect(8 * squareSize, 0, 6 * squareSize, 8 * squareSize);
    fill(0);
    textSize((squareSize / 50) * 17);
    text("Settings and Stuff", 9.8 * squareSize, 0.5 * squareSize);

    startButton.position(8.6 * squareSize, 1.4 * squareSize);
    rematchButton.position(8.6 * squareSize, 2 * squareSize);
    resignButton.position(8.6 * squareSize, 2.6 * squareSize);
    whitePButton.position(8.6 * squareSize, 4.2 * squareSize);
    blackPButton.position(8.6 * squareSize, 5.4 * squareSize);
    fill(225);
    rect(8.1 * squareSize, 4.2 * squareSize, 2.5 * squareSize, squareSize);
    rect(
      8.1 * squareSize,
      5.9 * squareSize,
      2.5 * squareSize,
      0.5 * squareSize
    );
    fill(0);
    textSize((squareSize / 50) * 15);
    text(whiteDisplayText, 8.6 * squareSize, 5 * squareSize);
    text(blackDisplayText, 8.6 * squareSize, 6.2 * squareSize);
    textSize((squareSize / 50) * 11);
    text(
      "Can't be changed during the game:",
      8.5 * squareSize,
      3.3 * squareSize,
      2.3 * squareSize,
      3.4 * squareSize
    );
    textSize((squareSize / 50) * 11);
    text(
      "Minimum time for bots to move (ms):",
      8.4 * squareSize,
      6.6 * squareSize,
      2.3 * squareSize,
      3.4 * squareSize
    );
    textSize((squareSize / 50) * 10);
    text(
      JSON.stringify(botSpeedMiliseconds),
      9.2 * squareSize,
      7.5 * squareSize
    );
    textSize((squareSize / 50) * 9);

    text(
      "Square Size(px): " + JSON.stringify(squareSize),
      8.7 * squareSize,
      0.9 * squareSize
    );

    addButton.position(9.85 * squareSize, 7.3 * squareSize);
    minButton.position(8.7 * squareSize, 7.3 * squareSize);
    addaddButton.position(10.35 * squareSize, 7.3 * squareSize);
    minminButton.position(8.2 * squareSize, 7.3 * squareSize);
    sizeSlider.position(8.6 * squareSize, squareSize);
    textSize((squareSize / 50) * 12);
    text(
      "Promotion takes input from keys being typed after clicking on the display. q = queen, n = knight, b = bishop, r = rook",
      11 * squareSize,
      0.9 * squareSize,
      3 * squareSize,
      10 * squareSize
    );
    text(
      "Please email me at harqian@nuevaschool.org if you find any bugs",
      11 * squareSize,
      2.6 * squareSize,
      3 * squareSize,
      10 * squareSize
    );
  }

  if (gameState === 1) {
    board(dperspective);
    hover();
    pieceGeneration(dperspective);
  } else if (gameState === 0) {
    bitstringToBoardDraw(bitstringHistory[historyNum], dperspective);
  }
  if (
    checkCheck(whiteVision, blackVision, whiteKingPos, blackKingPos, "White") &&
    turn === "White"
  ) {
    if (gameState === 1){
      fill(checkColor);
      if (dperspective) {
        ellipse(
          whiteKingPos.x * squareSize + squareSize / 2,
          whiteKingPos.y * squareSize + squareSize / 2,
          (2 / 3) * squareSize,
          (2 / 3) * squareSize
        );
      } else {
        ellipse(
          (7 - whiteKingPos.x) * squareSize + squareSize / 2,
          (7 - whiteKingPos.y) * squareSize + squareSize / 2,
          (2 / 3) * squareSize,
          (2 / 3) * squareSize
        );
      }
    }
    checkHistory[turnNumber] = {
      x: whiteKingPos.x,
      y: whiteKingPos.y,
    };
  } else if (
    checkCheck(whiteVision, blackVision, whiteKingPos, blackKingPos, "Black") &&
    turn === "Black"
  ) {
    if (gameState === 1){
      fill(checkColor);
      if (dperspective) {
        ellipse(
          blackKingPos.x * squareSize + squareSize / 2,
          blackKingPos.y * squareSize + squareSize / 2,
          (2 / 3) * squareSize,
          (2 / 3) * squareSize
        );
      } else {
        ellipse(
          (7 - blackKingPos.x) * squareSize + squareSize / 2,
          (7 - blackKingPos.y) * squareSize + squareSize / 2,
          (2 / 3) * squareSize,
          (2 / 3) * squareSize
        );
      }
    }
    checkHistory[turnNumber] = {
      x: blackKingPos.x,
      y: blackKingPos.y,
    };
  }
  if (selectedPiece && selectedPieceCoords && gameState === 1) {
    selectedPiece.drawMovement(
      selectedPieceCoords.x,
      selectedPieceCoords.y,
      dperspective
    );
  }
  //check mate, stalemate, insufficient material
  if (turn === "White") {
    if (
      whiteMoves.length === 0 &&
      checkCheck(whiteVision, blackVision, whiteKingPos, blackKingPos, "White")
    ) {
      bigSign("Checkmate: Black wins!");
    }
    if (
      whiteMoves.length === 0 &&
      !checkCheck(whiteVision, blackVision, whiteKingPos, blackKingPos, "White")
    ) {
      bigSign("Stalemate: DRAW!");
    }
  } else {
    if (
      blackMoves.length === 0 &&
      checkCheck(whiteVision, blackVision, whiteKingPos, blackKingPos, "Black")
    ) {
      bigSign("Checkmate: White wins!");
    }

    if (
      blackMoves.length === 0 &&
      !checkCheck(whiteVision, blackVision, whiteKingPos, blackKingPos, "Black")
    ) {
      bigSign("Stalemate: DRAW!");
    }
  }
  if (
    (arrayIsSame(whitePieces, [0, 0, 1, 0, 0]) &&
      arrayIsSame(blackPieces, [0, 0, 0, 0, 0])) ||
    (arrayIsSame(whitePieces, [0, 0, 0, 0, 0]) &&
      arrayIsSame(blackPieces, [0, 0, 1, 0, 0])) ||
    (arrayIsSame(whitePieces, [0, 1, 0, 0, 0]) &&
      arrayIsSame(blackPieces, [0, 0, 0, 0, 0])) ||
    (arrayIsSame(whitePieces, [0, 0, 0, 0, 0]) &&
      arrayIsSame(blackPieces, [0, 1, 0, 0, 0])) ||
    (arrayIsSame(whitePieces, [0, 0, 0, 0, 0]) &&
      arrayIsSame(blackPieces, [0, 0, 0, 0, 0]))
  ) {
    bigSign("Insufficient Material: DRAW!");
  }
  if (isThreeFolded) {
    bigSign("Threefold Repetition: DRAW!");
  }
  if (isResigned) {
    gameEndCalls()
    bigSign("Game Ended");
  }
}
