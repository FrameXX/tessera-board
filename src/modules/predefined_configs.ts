export const PREDEFINED_DEFAULT_BOARD_CONFIGS = [
  {
    id: "default",
    name: "Default",
    description: "Classic checkboard setup as you know it.",
    values: [
      '[[{"pieceId":"rook","color":"white"},{"pieceId":"knight","color":"white"},{"pieceId":"bishop","color":"white"},{"pieceId":"queen","color":"white"},{"pieceId":"king","color":"white"},{"pieceId":"bishop","color":"white"},{"pieceId":"knight","color":"white"},{"pieceId":"rook","color":"white"}],[{"pieceId":"pawn","color":"white"},{"pieceId":"pawn","color":"white"},{"pieceId":"pawn","color":"white"},{"pieceId":"pawn","color":"white"},{"pieceId":"pawn","color":"white"},{"pieceId":"pawn","color":"white"},{"pieceId":"pawn","color":"white"},{"pieceId":"pawn","color":"white"}],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[{"pieceId":"pawn","color":"black"},{"pieceId":"pawn","color":"black"},{"pieceId":"pawn","color":"black"},{"pieceId":"pawn","color":"black"},{"pieceId":"pawn","color":"black"},{"pieceId":"pawn","color":"black"},{"pieceId":"pawn","color":"black"},{"pieceId":"pawn","color":"black"}],[{"pieceId":"rook","color":"black"},{"pieceId":"knight","color":"black"},{"pieceId":"bishop","color":"black"},{"pieceId":"queen","color":"black"},{"pieceId":"king","color":"black"},{"pieceId":"bishop","color":"black"},{"pieceId":"knight","color":"black"},{"pieceId":"rook","color":"black"}]]',
    ],
  },
  {
    id: "philidor_defence",
    name: "Philidor Defence",
    description: `The Philidor Defence (or Philidor's Defence) is a chess opening characterised by the moves: \n1. e4 e5\n2. Nf3 d6.\nThe opening is named after the famous 18th-century player François-André Danican Philidor, who advocated it as an alternative to the common 2...Nc6. His original idea was to challenge White's centre by the pawn thrust ...f7–f5. Source: Wikipedia.`,
    values: [
      '[[{"pieceId":"rook","color":"white"},{"pieceId":"knight","color":"white"},{"pieceId":"bishop","color":"white"},{"pieceId":"queen","color":"white"},{"pieceId":"king","color":"white"},{"pieceId":"bishop","color":"white"},null,{"pieceId":"rook","color":"white"}],[{"pieceId":"pawn","color":"white"},{"pieceId":"pawn","color":"white"},{"pieceId":"pawn","color":"white"},{"pieceId":"pawn","color":"white"},null,{"pieceId":"pawn","color":"white"},{"pieceId":"pawn","color":"white"},{"pieceId":"pawn","color":"white"}],[null,null,null,null,null,{"pieceId":"knight","color":"white"},null,null],[null,null,null,null,{"pieceId":"pawn","color":"white"},null,null,null],[null,null,null,null,{"pieceId":"pawn","color":"black"},null,null,null],[null,null,null,{"pieceId":"pawn","color":"black"},null,null,null,null],[{"pieceId":"pawn","color":"black"},{"pieceId":"pawn","color":"black"},{"pieceId":"pawn","color":"black"},null,null,{"pieceId":"pawn","color":"black"},{"pieceId":"pawn","color":"black"},{"pieceId":"pawn","color":"black"}],[{"pieceId":"rook","color":"black"},{"pieceId":"knight","color":"black"},{"pieceId":"bishop","color":"black"},{"pieceId":"queen","color":"black"},{"pieceId":"king","color":"black"},{"pieceId":"bishop","color":"black"},{"pieceId":"knight","color":"black"},{"pieceId":"rook","color":"black"}]]',
    ],
  },
];
