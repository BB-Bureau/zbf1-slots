export const idl = {
  version: "0.1.0",
  name: "zeus_anchor",
  instructions: [
    {
      name: "playRndGame",
      accounts: [
        {
          name: "payer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "game",
          isMut: true,
          isSigner: false,
        },
        {
          name: "recentSlothashes",
          isMut: false,
          isSigner: false,
        },
        {
          name: "userCollateralTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "collateralTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "zeusInfo",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "amount",
          type: "u64",
        },
      ],
    },
  ],
  accounts: [
    {
      name: "ZeusInfo",
      type: {
        kind: "struct",
        fields: [
          {
            name: "bump",
            type: "u8",
          },
          {
            name: "operators",
            type: {
              vec: "publicKey",
            },
          },
          {
            name: "collateralTokenAccount",
            type: "publicKey",
          },
          {
            name: "maxSellPressure",
            type: "u128",
          },
          {
            name: "collateralMint",
            type: "publicKey",
          },
          {
            name: "currentInfoUrl",
            type: "string",
          },
        ],
      },
    },
    {
      name: "RndGame",
      type: {
        kind: "struct",
        fields: [
          {
            name: "balance",
            type: "u64",
          },
          {
            name: "seed",
            type: "string",
          },
          {
            name: "chancesAnMult",
            type: {
              vec: {
                defined: "ChanceAndMult",
              },
            },
          },
        ],
      },
    },
  ],
  types: [
    {
      name: "ChanceAndMult",
      type: {
        kind: "struct",
        fields: [
          {
            name: "chances",
            type: "u64",
          },
          {
            name: "multiplier",
            type: "u64",
          },
        ],
      },
    },
  ],
  errors: [
    {
      code: 6000,
      name: "Teapot",
      msg: "I'm a Teapot!",
    },
  ],
  metadata: {
    address: "BXMH1F15xn9gZaMoY2hRdEwrnZf3JHeuXWLsZAuoeFhR",
  },
};
