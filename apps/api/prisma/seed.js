require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaNeon } = require("@prisma/adapter-neon");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient({
  adapter: new PrismaNeon({
    connectionString: process.env.DATABASE_URL,
  }),
});

// Vehicle catalog data - detailed makes and models with dimensions
// Structure: Make -> Model -> Array of { years, desc, length, width, height, weight }
const VEHICLE_CATALOG = {
  "Toyota": {
    "Agya": [
      {
        "years": "2014-2022",
        "length": 3660,
        "width": 1600,
        "height": 1520,
        "weight": 1958
      },
      {
        "years": "2023-2026",
        "length": 3760,
        "width": 1665,
        "height": 1505,
        "weight": 2073
      }
    ],
    "Starlet": [
      {
        "years": "1990-1999",
        "length": 3720,
        "width": 1600,
        "height": 1380,
        "weight": 1807
      },
      {
        "years": "2020-2026",
        "length": 3990,
        "width": 1745,
        "height": 1500,
        "weight": 2298
      }
    ],
    "Raize": [
      {
        "years": "2022-2026",
        "length": 4030,
        "width": 1710,
        "height": 1635,
        "weight": 2817
      }
    ],
    "Tercel": [
      {
        "years": "1991-1999",
        "length": 4120,
        "width": 1660,
        "height": 1350,
        "weight": 2308
      }
    ],
    "Echo": [
      {
        "years": "2000-2005",
        "length": 4150,
        "width": 1660,
        "height": 1510,
        "weight": 2601
      }
    ],
    "Yaris Cross": [
      {
        "years": "2021-2026",
        "length": 4180,
        "width": 1765,
        "height": 1560,
        "weight": 2877
      }
    ],
    "Probox": [
      {
        "years": "2002-2026",
        "length": 4195,
        "width": 1695,
        "height": 1500,
        "weight": 2666
      }
    ],
    "GT86": [
      {
        "years": "2012-2021",
        "length": 4240,
        "width": 1775,
        "height": 1285,
        "weight": 2418
      }
    ],
    "GR86": [
      {
        "years": "2022-2026",
        "length": 4265,
        "width": 1775,
        "height": 1310,
        "weight": 2479
      }
    ],
    "Corolla Hatchback": [
      {
        "years": "2019-2026",
        "length": 4370,
        "width": 1790,
        "height": 1435,
        "weight": 2806
      }
    ],
    "Supra": [
      {
        "years": "1993-2002",
        "length": 4514,
        "width": 1811,
        "height": 1265,
        "weight": 2896
      },
      {
        "years": "2019-2026",
        "length": 4379,
        "width": 1854,
        "height": 1294,
        "weight": 2626
      }
    ],
    "C-HR": [
      {
        "years": "2017-2023",
        "length": 4360,
        "width": 1795,
        "height": 1565,
        "weight": 3000
      }
    ],
    "Avanza": [
      {
        "years": "2012-2021",
        "length": 4190,
        "width": 1660,
        "height": 1695,
        "weight": 2947
      },
      {
        "years": "2022-2026",
        "length": 4395,
        "width": 1730,
        "height": 1700,
        "weight": 3000
      }
    ],
    "Rush": [
      {
        "years": "2018-2026",
        "length": 4435,
        "width": 1695,
        "height": 1705,
        "weight": 3000
      }
    ],
    "Corolla Cross": [
      {
        "years": "2021-2026",
        "length": 4460,
        "width": 1825,
        "height": 1620,
        "weight": 3000
      }
    ],
    "Celica": [
      {
        "years": "1994-1999",
        "length": 4425,
        "width": 1750,
        "height": 1305,
        "weight": 2526
      },
      {
        "years": "2000-2006",
        "length": 4335,
        "width": 1735,
        "height": 1310,
        "weight": 2463
      }
    ],
    "Corona": [
      {
        "years": "1992-1998",
        "length": 4520,
        "width": 1695,
        "height": 1410,
        "weight": 3000
      }
    ],
    "Rav4": [
      {
        "years": "2001-2005",
        "length": 4245,
        "width": 1735,
        "height": 1680,
        "weight": 3000
      },
      {
        "years": "2006-2012",
        "length": 4600,
        "width": 1815,
        "height": 1685,
        "weight": 3000
      },
      {
        "years": "2013-2018",
        "length": 4570,
        "width": 1845,
        "height": 1660,
        "weight": 3000
      },
      {
        "years": "2019-2026",
        "length": 4600,
        "width": 1855,
        "height": 1685,
        "weight": 3000
      }
    ],
    "Prius": [
      {
        "years": "2016-2022",
        "length": 4575,
        "width": 1760,
        "height": 1470,
        "weight": 3000
      },
      {
        "years": "2023-2026",
        "length": 4600,
        "width": 1780,
        "height": 1430,
        "weight": 3000
      }
    ],
    "Corolla": [
      {
        "years": "1993-1997",
        "length": 4270,
        "width": 1685,
        "height": 1380,
        "weight": 2482
      },
      {
        "years": "1998-2002",
        "length": 4315,
        "width": 1690,
        "height": 1385,
        "weight": 2525
      },
      {
        "years": "2003-2008",
        "length": 4530,
        "width": 1700,
        "height": 1480,
        "weight": 3000
      },
      {
        "years": "2009-2013",
        "length": 4540,
        "width": 1760,
        "height": 1465,
        "weight": 3000
      },
      {
        "years": "2014-2019",
        "length": 4620,
        "width": 1775,
        "height": 1460,
        "weight": 3000
      },
      {
        "years": "2020-2026",
        "length": 4630,
        "width": 1780,
        "height": 1435,
        "weight": 3000
      }
    ],
    "FJ Cruiser": [
      {
        "years": "2007-2014",
        "length": 4670,
        "width": 1905,
        "height": 1830,
        "weight": 3000
      }
    ],
    "Prado (3 puertas)": [
      {
        "years": "2003-2009",
        "length": 4330,
        "width": 1875,
        "height": 1865,
        "weight": 3000
      },
      {
        "years": "2010-2023",
        "length": 4485,
        "width": 1885,
        "height": 1845,
        "weight": 3000
      }
    ],
    "Innova": [
      {
        "years": "2016-2022",
        "length": 4735,
        "width": 1830,
        "height": 1795,
        "weight": 3000
      },
      {
        "years": "2023-2026",
        "length": 4755,
        "width": 1850,
        "height": 1795,
        "weight": 3000
      }
    ],
    "Fortuner": [
      {
        "years": "2005-2015",
        "length": 4695,
        "width": 1840,
        "height": 1795,
        "weight": 3000
      },
      {
        "years": "2016-2026",
        "length": 4795,
        "width": 1855,
        "height": 1835,
        "weight": 3000
      }
    ],
    "4Runner": [
      {
        "years": "1996-2002",
        "length": 4655,
        "width": 1800,
        "height": 1750,
        "weight": 3000
      },
      {
        "years": "2003-2009",
        "length": 4800,
        "width": 1910,
        "height": 1810,
        "weight": 3000
      },
      {
        "years": "2010-2024",
        "length": 4820,
        "width": 1925,
        "height": 1780,
        "weight": 3000
      },
      {
        "years": "2025-2026",
        "length": 4950,
        "width": 1976,
        "height": 1798,
        "weight": 3000
      }
    ],
    "Prado (5 puertas)": [
      {
        "years": "1996-2002",
        "length": 4730,
        "width": 1820,
        "height": 1880,
        "weight": 3000
      },
      {
        "years": "2003-2009",
        "length": 4850,
        "width": 1875,
        "height": 1895,
        "weight": 3000
      },
      {
        "years": "2010-2023",
        "length": 4840,
        "width": 1885,
        "height": 1845,
        "weight": 3000
      },
      {
        "years": "2024-2026",
        "length": 4925,
        "width": 1980,
        "height": 1870,
        "weight": 3000
      }
    ],
    "Highlander": [
      {
        "years": "2014-2019",
        "length": 4855,
        "width": 1925,
        "height": 1730,
        "weight": 3000
      },
      {
        "years": "2020-2026",
        "length": 4950,
        "width": 1930,
        "height": 1730,
        "weight": 3000
      }
    ],
    "Camry": [
      {
        "years": "2018-2026",
        "length": 4885,
        "width": 1840,
        "height": 1445,
        "weight": 3000
      }
    ],
    "Land Cruiser 70 (Hardtop)": [
      {
        "years": "1984-2026",
        "length": 4910,
        "width": 1870,
        "height": 1940,
        "weight": 3000
      }
    ],
    "Land Cruiser 100": [
      {
        "years": "1998-2007",
        "length": 4890,
        "width": 1940,
        "height": 1870,
        "weight": 3000
      }
    ],
    "Land Cruiser 200": [
      {
        "years": "2008-2021",
        "length": 4950,
        "width": 1980,
        "height": 1900,
        "weight": 3000
      }
    ],
    "Land Cruiser 300": [
      {
        "years": "2022-2026",
        "length": 4985,
        "width": 1980,
        "height": 1945,
        "weight": 3000
      }
    ],
    "Sienna": [
      {
        "years": "2011-2020",
        "length": 5085,
        "width": 1985,
        "height": 1750,
        "weight": 3000
      },
      {
        "years": "2021-2026",
        "length": 5175,
        "width": 1995,
        "height": 1740,
        "weight": 3000
      }
    ],
    "Sequoia": [
      {
        "years": "2008-2022",
        "length": 5210,
        "width": 2030,
        "height": 1955,
        "weight": 3000
      },
      {
        "years": "2023-2026",
        "length": 5286,
        "width": 2022,
        "height": 1885,
        "weight": 3000
      }
    ],
    "Hilux (Cabina Sencilla)": [
      {
        "years": "1998-2004",
        "length": 4790,
        "width": 1690,
        "height": 1650,
        "weight": 3000
      },
      {
        "years": "2005-2015",
        "length": 5260,
        "width": 1760,
        "height": 1680,
        "weight": 3000
      },
      {
        "years": "2016-2026",
        "length": 5330,
        "width": 1800,
        "height": 1690,
        "weight": 3000
      }
    ],
    "Hilux (Extra Cabina)": [
      {
        "years": "2005-2015",
        "length": 5260,
        "width": 1835,
        "height": 1795,
        "weight": 3000
      },
      {
        "years": "2016-2026",
        "length": 5330,
        "width": 1855,
        "height": 1810,
        "weight": 3000
      }
    ],
    "Hilux (Doble Cabina)": [
      {
        "years": "1989-1997",
        "length": 4850,
        "width": 1690,
        "height": 1795,
        "weight": 3000
      },
      {
        "years": "1998-2004",
        "length": 4980,
        "width": 1690,
        "height": 1750,
        "weight": 3000
      },
      {
        "years": "2005-2015",
        "length": 5255,
        "width": 1835,
        "height": 1810,
        "weight": 3000
      },
      {
        "years": "2016-2026",
        "length": 5325,
        "width": 1855,
        "height": 1815,
        "weight": 3000
      }
    ],
    "Tacoma": [
      {
        "years": "2005-2015",
        "length": 5285,
        "width": 1895,
        "height": 1785,
        "weight": 3000
      },
      {
        "years": "2016-2023",
        "length": 5390,
        "width": 1910,
        "height": 1795,
        "weight": 3000
      },
      {
        "years": "2024-2026",
        "length": 5410,
        "width": 1950,
        "height": 1890,
        "weight": 3000
      }
    ],
    "Tundra": [
      {
        "years": "2007-2021",
        "length": 5810,
        "width": 2030,
        "height": 1930,
        "weight": 3000
      },
      {
        "years": "2022-2026",
        "length": 5930,
        "width": 2035,
        "height": 1980,
        "weight": 3000
      }
    ],
    "Hiace": [
      {
        "years": "1990-2004",
        "length": 4690,
        "width": 1690,
        "height": 1980,
        "weight": 3000
      },
      {
        "years": "2005-2018",
        "length": 5380,
        "width": 1880,
        "height": 2105,
        "weight": 3000
      },
      {
        "years": "2019-2026",
        "length": 5915,
        "width": 1950,
        "height": 2280,
        "weight": 3000
      }
    ],
    "Coaster": [
      {
        "years": "1993-2016",
        "length": 6990,
        "width": 2080,
        "height": 2635,
        "weight": 3000
      },
      {
        "years": "2017-2026",
        "length": 7175,
        "width": 2080,
        "height": 2635,
        "weight": 3000
      }
    ],
    "Scion Xa": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Scion Tc": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Scion Xb": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Land Cruiser": [
      {
        "years": "2000-2026",
        "length": 5200,
        "width": 1950,
        "height": 1850,
        "weight": 3000
      }
    ],
    "Scion Fr-s": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Yaris": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Avalon": [
      {
        "years": "2000-2026",
        "length": 5100,
        "width": 1900,
        "height": 1450,
        "weight": 3000
      }
    ],
    "Corolla Matrix": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Camry Solara": [
      {
        "years": "2000-2026",
        "length": 4800,
        "width": 1820,
        "height": 1420,
        "weight": 3000
      }
    ],
    "Scion Xd": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Venza": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Fchv-adv": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Paseo": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Cressida": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Cargo Van": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Previa": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Mirai": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Scion Iq": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Scion Im": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Scion Ia": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Prius V": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Prius C": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Pick-up": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Van": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Corolla Im": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Prius Prime (phev)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Yaris Ia": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Rav4 Prime (phev)": [
      {
        "years": "2000-2026",
        "length": 4500,
        "width": 1800,
        "height": 1650,
        "weight": 3000
      }
    ],
    "Bz4x": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Crown": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Gr Corolla": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Grand Highlander": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Crown Signia": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Bz Woodland": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ]
  },
  "Lexus": {
    "LBX": [
      {
        "years": "2024-2026",
        "length": 4190,
        "width": 1825,
        "height": 1545,
        "weight": 2954
      }
    ],
    "CT 200h": [
      {
        "years": "2011-2022",
        "length": 4320,
        "width": 1765,
        "height": 1430,
        "weight": 2726
      }
    ],
    "IS": [
      {
        "years": "2013-2020",
        "length": 4665,
        "width": 1810,
        "height": 1430,
        "weight": 3000
      },
      {
        "years": "2021-2026",
        "length": 4710,
        "width": 1840,
        "height": 1435,
        "weight": 3000
      }
    ],
    "ES": [
      {
        "years": "2018-2026",
        "length": 4975,
        "width": 1865,
        "height": 1445,
        "weight": 3000
      }
    ],
    "LS": [
      {
        "years": "2017-2026",
        "length": 5235,
        "width": 1900,
        "height": 1450,
        "weight": 3000
      }
    ],
    "UX": [
      {
        "years": "2019-2026",
        "length": 4495,
        "width": 1840,
        "height": 1520,
        "weight": 3000
      }
    ],
    "NX": [
      {
        "years": "2014-2021",
        "length": 4630,
        "width": 1845,
        "height": 1645,
        "weight": 3000
      },
      {
        "years": "2022-2026",
        "length": 4660,
        "width": 1865,
        "height": 1640,
        "weight": 3000
      }
    ],
    "RZ (Electric)": [
      {
        "years": "2023-2026",
        "length": 4805,
        "width": 1895,
        "height": 1635,
        "weight": 3000
      }
    ],
    "RX": [
      {
        "years": "2015-2022",
        "length": 4890,
        "width": 1895,
        "height": 1690,
        "weight": 3000
      },
      {
        "years": "2023-2026",
        "length": 4890,
        "width": 1920,
        "height": 1695,
        "weight": 3000
      }
    ],
    "GX": [
      {
        "years": "2010-2023",
        "length": 4880,
        "width": 1885,
        "height": 1845,
        "weight": 3000
      },
      {
        "years": "2024-2026",
        "length": 4950,
        "width": 1980,
        "height": 1865,
        "weight": 3000
      }
    ],
    "TX": [
      {
        "years": "2024-2026",
        "length": 5159,
        "width": 1989,
        "height": 1781,
        "weight": 3000
      }
    ],
    "LX": [
      {
        "years": "2015-2021",
        "length": 5065,
        "width": 1980,
        "height": 1865,
        "weight": 3000
      },
      {
        "years": "2022-2026",
        "length": 5100,
        "width": 1990,
        "height": 1885,
        "weight": 3000
      }
    ],
    "RC": [
      {
        "years": "2014-2026",
        "length": 4700,
        "width": 1840,
        "height": 1395,
        "weight": 3000
      }
    ],
    "LC": [
      {
        "years": "2017-2026",
        "length": 4770,
        "width": 1920,
        "height": 1345,
        "weight": 3000
      }
    ],
    "LFA": [
      {
        "years": "2011-2012",
        "length": 4505,
        "width": 1895,
        "height": 1220,
        "weight": 2916
      }
    ]
  },
  "Nissan": {
    "March": [
      {
        "years": "2011-2020",
        "length": 3780,
        "width": 1665,
        "height": 1530,
        "weight": 2118
      },
      {
        "years": "2021-2026",
        "length": 3825,
        "width": 1665,
        "height": 1530,
        "weight": 2144
      }
    ],
    "Magnite": [
      {
        "years": "2021-2026",
        "length": 3994,
        "width": 1758,
        "height": 1572,
        "weight": 2428
      }
    ],
    "Versa Note": [
      {
        "years": "2014-2019",
        "length": 4140,
        "width": 1695,
        "height": 1535,
        "weight": 2693
      }
    ],
    "Juke": [
      {
        "years": "2011-2019",
        "length": 4135,
        "width": 1765,
        "height": 1565,
        "weight": 2855
      },
      {
        "years": "2020-2026",
        "length": 4210,
        "width": 1800,
        "height": 1595,
        "weight": 3000
      }
    ],
    "Tiida Hatchback": [
      {
        "years": "2004-2012",
        "length": 4205,
        "width": 1695,
        "height": 1535,
        "weight": 2735
      }
    ],
    "Kicks": [
      {
        "years": "2017-2021",
        "length": 4295,
        "width": 1760,
        "height": 1590,
        "weight": 3000
      },
      {
        "years": "2022-2026",
        "length": 4330,
        "width": 1765,
        "height": 1590,
        "weight": 3000
      }
    ],
    "Sentra B13": [
      {
        "years": "1991-2017",
        "length": 4325,
        "width": 1640,
        "height": 1380,
        "weight": 2447
      }
    ],
    "Qashqai": [
      {
        "years": "2007-2013",
        "length": 4315,
        "width": 1785,
        "height": 1605,
        "weight": 3000
      },
      {
        "years": "2014-2021",
        "length": 4370,
        "width": 1800,
        "height": 1595,
        "weight": 3000
      },
      {
        "years": "2022-2026",
        "length": 4425,
        "width": 1835,
        "height": 1625,
        "weight": 3000
      }
    ],
    "Tiida Sedan": [
      {
        "years": "2004-2018",
        "length": 4420,
        "width": 1695,
        "height": 1530,
        "weight": 2866
      }
    ],
    "Versa": [
      {
        "years": "2012-2019",
        "length": 4500,
        "width": 1699,
        "height": 1532,
        "weight": 2928
      },
      {
        "years": "2020-2026",
        "length": 4542,
        "width": 1749,
        "height": 1504,
        "weight": 3000
      }
    ],
    "Sentra": [
      {
        "years": "2000-2006",
        "length": 4510,
        "width": 1710,
        "height": 1410,
        "weight": 3000
      },
      {
        "years": "2007-2012",
        "length": 4565,
        "width": 1790,
        "height": 1510,
        "weight": 3000
      },
      {
        "years": "2013-2019",
        "length": 4625,
        "width": 1760,
        "height": 1495,
        "weight": 3000
      },
      {
        "years": "2020-2026",
        "length": 4645,
        "width": 1815,
        "height": 1445,
        "weight": 3000
      }
    ],
    "X-Trail": [
      {
        "years": "2001-2007",
        "length": 4455,
        "width": 1765,
        "height": 1700,
        "weight": 3000
      },
      {
        "years": "2008-2013",
        "length": 4630,
        "width": 1800,
        "height": 1685,
        "weight": 3000
      },
      {
        "years": "2014-2021",
        "length": 4640,
        "width": 1820,
        "height": 1710,
        "weight": 3000
      },
      {
        "years": "2022-2026",
        "length": 4680,
        "width": 1840,
        "height": 1720,
        "weight": 3000
      }
    ],
    "Murano": [
      {
        "years": "2003-2008",
        "length": 4770,
        "width": 1880,
        "height": 1705,
        "weight": 3000
      },
      {
        "years": "2009-2014",
        "length": 4835,
        "width": 1885,
        "height": 1720,
        "weight": 3000
      },
      {
        "years": "2015-2024",
        "length": 4885,
        "width": 1915,
        "height": 1690,
        "weight": 3000
      }
    ],
    "Pathfinder": [
      {
        "years": "1997-2004",
        "length": 4760,
        "width": 1840,
        "height": 1770,
        "weight": 3000
      },
      {
        "years": "2005-2012",
        "length": 4850,
        "width": 1850,
        "height": 1780,
        "weight": 3000
      },
      {
        "years": "2013-2021",
        "length": 5008,
        "width": 1960,
        "height": 1767,
        "weight": 3000
      },
      {
        "years": "2022-2026",
        "length": 5004,
        "width": 1978,
        "height": 1778,
        "weight": 3000
      }
    ],
    "Patrol": [
      {
        "years": "1998-2009",
        "length": 5050,
        "width": 1930,
        "height": 1855,
        "weight": 3000
      },
      {
        "years": "2010-2026",
        "length": 5165,
        "width": 1995,
        "height": 1940,
        "weight": 3000
      }
    ],
    "Frontier (Cabina Sencilla)": [
      {
        "years": "1998-2008",
        "length": 4890,
        "width": 1690,
        "height": 1625,
        "weight": 3000
      },
      {
        "years": "2009-2015",
        "length": 5120,
        "width": 1770,
        "height": 1720,
        "weight": 3000
      },
      {
        "years": "2016-2026",
        "length": 5235,
        "width": 1790,
        "height": 1750,
        "weight": 3000
      }
    ],
    "Frontier (Doble Cabina)": [
      {
        "years": "1998-2004",
        "length": 4980,
        "width": 1690,
        "height": 1650,
        "weight": 3000
      },
      {
        "years": "2005-2014",
        "length": 5220,
        "width": 1850,
        "height": 1775,
        "weight": 3000
      },
      {
        "years": "2015-2026",
        "length": 5260,
        "width": 1850,
        "height": 1860,
        "weight": 3000
      }
    ],
    "Navara": [
      {
        "years": "2008-2014",
        "length": 5230,
        "width": 1850,
        "height": 1780,
        "weight": 3000
      },
      {
        "years": "2015-2026",
        "length": 5330,
        "width": 1850,
        "height": 1840,
        "weight": 3000
      }
    ],
    "Armada": [
      {
        "years": "2004-2015",
        "length": 5275,
        "width": 2000,
        "height": 1960,
        "weight": 3000
      },
      {
        "years": "2017-2026",
        "length": 5305,
        "width": 2030,
        "height": 1925,
        "weight": 3000
      }
    ],
    "Titan": [
      {
        "years": "2004-2015",
        "length": 5700,
        "width": 2000,
        "height": 1900,
        "weight": 3000
      },
      {
        "years": "2016-2024",
        "length": 5790,
        "width": 2020,
        "height": 1960,
        "weight": 3000
      }
    ],
    "Urvan": [
      {
        "years": "1999-2012",
        "length": 4695,
        "width": 1695,
        "height": 1975,
        "weight": 3000
      },
      {
        "years": "2013-2026",
        "length": 5230,
        "width": 1880,
        "height": 2285,
        "weight": 3000
      }
    ],
    "Altima": [
      {
        "years": "2000-2026",
        "length": 4800,
        "width": 1820,
        "height": 1420,
        "weight": 3000
      }
    ],
    "Leaf": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Rogue": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Xterra": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Frontier": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Maxima": [
      {
        "years": "2000-2026",
        "length": 5100,
        "width": 1900,
        "height": 1450,
        "weight": 3000
      }
    ],
    "Cube": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Altra-ev": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Axxess": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Van": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Sentra Classic": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Altra": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Micra": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Rogue Select": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Nissan Z": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Ariya Hatchback": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Kicks Play": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Kicks Mpv": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Ariya Mpv": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ]
  },
  "Infiniti": {
    "QX30": [
      {
        "years": "2016-2019",
        "length": 4425,
        "width": 1815,
        "height": 1515,
        "weight": 3000
      }
    ],
    "G35 Coupe": [
      {
        "years": "2003-2007",
        "length": 4628,
        "width": 1815,
        "height": 1392,
        "weight": 3000
      }
    ],
    "G37 Coupe": [
      {
        "years": "2008-2013",
        "length": 4651,
        "width": 1824,
        "height": 1394,
        "weight": 3000
      }
    ],
    "Q60 Coupe": [
      {
        "years": "2014-2015",
        "length": 4651,
        "width": 1824,
        "height": 1392,
        "weight": 3000
      },
      {
        "years": "2017-2022",
        "length": 4690,
        "width": 1850,
        "height": 1395,
        "weight": 3000
      }
    ],
    "G37 Convertible": [
      {
        "years": "2009-2013",
        "length": 4656,
        "width": 1852,
        "height": 1400,
        "weight": 3000
      }
    ],
    "QX50": [
      {
        "years": "2014-2017",
        "length": 4630,
        "width": 1800,
        "height": 1590,
        "weight": 3000
      },
      {
        "years": "2018-2026",
        "length": 4691,
        "width": 1902,
        "height": 1676,
        "weight": 3000
      }
    ],
    "QX55": [
      {
        "years": "2021-2026",
        "length": 4732,
        "width": 1902,
        "height": 1621,
        "weight": 3000
      }
    ],
    "G35 Sedan": [
      {
        "years": "2003-2006",
        "length": 4732,
        "width": 1750,
        "height": 1465,
        "weight": 3000
      },
      {
        "years": "2007-2008",
        "length": 4750,
        "width": 1773,
        "height": 1453,
        "weight": 3000
      }
    ],
    "G37 Sedan": [
      {
        "years": "2009-2013",
        "length": 4750,
        "width": 1773,
        "height": 1453,
        "weight": 3000
      }
    ],
    "Q50": [
      {
        "years": "2014-2024",
        "length": 4790,
        "width": 1820,
        "height": 1445,
        "weight": 3000
      },
      {
        "years": "2025-2026",
        "length": 4815,
        "width": 1825,
        "height": 1450,
        "weight": 3000
      }
    ],
    "FX35": [
      {
        "years": "2003-2008",
        "length": 4803,
        "width": 1925,
        "height": 1651,
        "weight": 3000
      },
      {
        "years": "2009-2012",
        "length": 4859,
        "width": 1928,
        "height": 1651,
        "weight": 3000
      }
    ],
    "FX45": [
      {
        "years": "2003-2008",
        "length": 4803,
        "width": 1925,
        "height": 1674,
        "weight": 3000
      }
    ],
    "FX37": [
      {
        "years": "2013",
        "length": 4859,
        "width": 1928,
        "height": 1651,
        "weight": 3000
      }
    ],
    "FX50": [
      {
        "years": "2009-2013",
        "length": 4859,
        "width": 1928,
        "height": 1679,
        "weight": 3000
      }
    ],
    "QX70": [
      {
        "years": "2014-2019",
        "length": 4865,
        "width": 1925,
        "height": 1680,
        "weight": 3000
      }
    ],
    "Q70": [
      {
        "years": "2014-2019",
        "length": 4945,
        "width": 1845,
        "height": 1500,
        "weight": 3000
      }
    ],
    "QX60": [
      {
        "years": "2013-2021",
        "length": 4990,
        "width": 1960,
        "height": 1745,
        "weight": 3000
      },
      {
        "years": "2022-2026",
        "length": 5032,
        "width": 1981,
        "height": 1770,
        "weight": 3000
      }
    ],
    "QX80": [
      {
        "years": "2014-2024",
        "length": 5305,
        "width": 2030,
        "height": 1925,
        "weight": 3000
      },
      {
        "years": "2025-2026",
        "length": 5364,
        "width": 2115,
        "height": 1945,
        "weight": 3000
      }
    ],
    "M35h": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ]
  },
  "Honda": {
    "Zest": [
      {
        "years": "2006-2012",
        "length": 3395,
        "width": 1475,
        "height": 1635,
        "weight": 1801
      }
    ],
    "Brio": [
      {
        "years": "2019-2026",
        "length": 3815,
        "width": 1680,
        "height": 1485,
        "weight": 2094
      }
    ],
    "Fit": [
      {
        "years": "2001-2008",
        "length": 3830,
        "width": 1675,
        "height": 1525,
        "weight": 2152
      },
      {
        "years": "2009-2014",
        "length": 3900,
        "width": 1695,
        "height": 1525,
        "weight": 2218
      },
      {
        "years": "2015-2020",
        "length": 4065,
        "width": 1700,
        "height": 1525,
        "weight": 2635
      },
      {
        "years": "2021-2026",
        "length": 3995,
        "width": 1695,
        "height": 1540,
        "weight": 2294
      }
    ],
    "WR-V": [
      {
        "years": "2017-2022",
        "length": 4000,
        "width": 1735,
        "height": 1600,
        "weight": 2776
      },
      {
        "years": "2023-2026",
        "length": 4060,
        "width": 1780,
        "height": 1608,
        "weight": 2905
      }
    ],
    "S2000": [
      {
        "years": "1999-2009",
        "length": 4120,
        "width": 1750,
        "height": 1285,
        "weight": 2316
      }
    ],
    "Civic Hatchback": [
      {
        "years": "1992-2000",
        "length": 4180,
        "width": 1695,
        "height": 1375,
        "weight": 2436
      },
      {
        "years": "2017-2021",
        "length": 4520,
        "width": 1800,
        "height": 1435,
        "weight": 3000
      },
      {
        "years": "2022-2026",
        "length": 4550,
        "width": 1800,
        "height": 1415,
        "weight": 3000
      }
    ],
    "HR-V": [
      {
        "years": "1999-2006",
        "length": 4000,
        "width": 1700,
        "height": 1690,
        "weight": 2873
      },
      {
        "years": "2015-2022",
        "length": 4330,
        "width": 1770,
        "height": 1605,
        "weight": 3000
      },
      {
        "years": "2023-2026",
        "length": 4567,
        "width": 1840,
        "height": 1620,
        "weight": 3000
      }
    ],
    "Element": [
      {
        "years": "2003-2011",
        "length": 4300,
        "width": 1815,
        "height": 1788,
        "weight": 3000
      }
    ],
    "Integra": [
      {
        "years": "1994-2001",
        "length": 4380,
        "width": 1710,
        "height": 1320,
        "weight": 2472
      },
      {
        "years": "2023-2026",
        "length": 4725,
        "width": 1830,
        "height": 1415,
        "weight": 3000
      }
    ],
    "City": [
      {
        "years": "2003-2008",
        "length": 4390,
        "width": 1690,
        "height": 1485,
        "weight": 2754
      },
      {
        "years": "2009-2013",
        "length": 4420,
        "width": 1695,
        "height": 1470,
        "weight": 2753
      },
      {
        "years": "2014-2020",
        "length": 4440,
        "width": 1695,
        "height": 1475,
        "weight": 2775
      },
      {
        "years": "2021-2026",
        "length": 4553,
        "width": 1748,
        "height": 1467,
        "weight": 3000
      }
    ],
    "Civic Sedan": [
      {
        "years": "1992-1995",
        "length": 4400,
        "width": 1695,
        "height": 1390,
        "weight": 2592
      },
      {
        "years": "1996-2000",
        "length": 4450,
        "width": 1705,
        "height": 1390,
        "weight": 2637
      },
      {
        "years": "2001-2005",
        "length": 4455,
        "width": 1720,
        "height": 1440,
        "weight": 2759
      },
      {
        "years": "2006-2011",
        "length": 4500,
        "width": 1755,
        "height": 1435,
        "weight": 2833
      },
      {
        "years": "2012-2015",
        "length": 4525,
        "width": 1755,
        "height": 1435,
        "weight": 3000
      },
      {
        "years": "2016-2021",
        "length": 4630,
        "width": 1798,
        "height": 1415,
        "weight": 3000
      },
      {
        "years": "2022-2026",
        "length": 4673,
        "width": 1800,
        "height": 1415,
        "weight": 3000
      }
    ],
    "Prelude": [
      {
        "years": "1992-1996",
        "length": 4440,
        "width": 1765,
        "height": 1290,
        "weight": 2527
      },
      {
        "years": "1997-2001",
        "length": 4545,
        "width": 1750,
        "height": 1315,
        "weight": 2929
      }
    ],
    "Stream": [
      {
        "years": "2000-2006",
        "length": 4550,
        "width": 1695,
        "height": 1590,
        "weight": 3000
      },
      {
        "years": "2007-2014",
        "length": 4570,
        "width": 1695,
        "height": 1545,
        "weight": 3000
      }
    ],
    "CR-V": [
      {
        "years": "1997-2001",
        "length": 4510,
        "width": 1750,
        "height": 1675,
        "weight": 3000
      },
      {
        "years": "2002-2006",
        "length": 4535,
        "width": 1785,
        "height": 1680,
        "weight": 3000
      },
      {
        "years": "2007-2011",
        "length": 4520,
        "width": 1820,
        "height": 1675,
        "weight": 3000
      },
      {
        "years": "2012-2016",
        "length": 4535,
        "width": 1820,
        "height": 1655,
        "weight": 3000
      },
      {
        "years": "2017-2022",
        "length": 4585,
        "width": 1855,
        "height": 1680,
        "weight": 3000
      },
      {
        "years": "2023-2026",
        "length": 4705,
        "width": 1865,
        "height": 1680,
        "weight": 3000
      }
    ],
    "Passport": [
      {
        "years": "1994-2002",
        "length": 4675,
        "width": 1785,
        "height": 1750,
        "weight": 3000
      },
      {
        "years": "2019-2026",
        "length": 4840,
        "width": 1995,
        "height": 1820,
        "weight": 3000
      }
    ],
    "Accord": [
      {
        "years": "1994-1997",
        "length": 4670,
        "width": 1780,
        "height": 1400,
        "weight": 3000
      },
      {
        "years": "1998-2002",
        "length": 4795,
        "width": 1785,
        "height": 1445,
        "weight": 3000
      },
      {
        "years": "2003-2007",
        "length": 4850,
        "width": 1820,
        "height": 1455,
        "weight": 3000
      },
      {
        "years": "2008-2012",
        "length": 4945,
        "width": 1845,
        "height": 1475,
        "weight": 3000
      },
      {
        "years": "2013-2017",
        "length": 4860,
        "width": 1850,
        "height": 1465,
        "weight": 3000
      },
      {
        "years": "2018-2022",
        "length": 4880,
        "width": 1860,
        "height": 1450,
        "weight": 3000
      },
      {
        "years": "2023-2026",
        "length": 4970,
        "width": 1860,
        "height": 1450,
        "weight": 3000
      }
    ],
    "Pilot": [
      {
        "years": "2003-2008",
        "length": 4775,
        "width": 1965,
        "height": 1790,
        "weight": 3000
      },
      {
        "years": "2009-2015",
        "length": 4850,
        "width": 1995,
        "height": 1845,
        "weight": 3000
      },
      {
        "years": "2016-2022",
        "length": 4940,
        "width": 1995,
        "height": 1775,
        "weight": 3000
      },
      {
        "years": "2023-2026",
        "length": 5085,
        "width": 1995,
        "height": 1830,
        "weight": 3000
      }
    ],
    "Odyssey": [
      {
        "years": "1995-2004",
        "length": 4840,
        "width": 1840,
        "height": 1670,
        "weight": 3000
      },
      {
        "years": "2005-2010",
        "length": 5105,
        "width": 1955,
        "height": 1750,
        "weight": 3000
      },
      {
        "years": "2011-2017",
        "length": 5155,
        "width": 2010,
        "height": 1735,
        "weight": 3000
      },
      {
        "years": "2018-2026",
        "length": 5210,
        "width": 1995,
        "height": 1765,
        "weight": 3000
      }
    ],
    "Ridgeline": [
      {
        "years": "2006-2014",
        "length": 5255,
        "width": 1975,
        "height": 1785,
        "weight": 3000
      },
      {
        "years": "2017-2026",
        "length": 5335,
        "width": 1995,
        "height": 1795,
        "weight": 3000
      }
    ],
    "Civic": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Insight": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Fcx Clarity": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Cr-z": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Gold Wing": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Metropolitan": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Nps50 (ruckus)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Interceptor": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Silverwing": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Sh150i": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Elite 80": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Helix": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Vt600 (shadow Vlx)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Cbr1100x": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Cbr954rr": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Elite 50": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Cbr900rr": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Vt1100 (shadow 1100)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Shadow": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Rc 45": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Cb-1": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Elite 250": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Elite": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Transalp": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Del Sol": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Trx700xx": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Trx450er": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Big Red": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Ev Plus": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Trx200dn": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Trx300ex": [
      {
        "years": "2000-2026",
        "length": 5100,
        "width": 1900,
        "height": 1450,
        "weight": 3000
      }
    ],
    "Trx300exn": [
      {
        "years": "2000-2026",
        "length": 5100,
        "width": 1900,
        "height": 1450,
        "weight": 3000
      }
    ],
    "Trx300fw": [
      {
        "years": "2000-2026",
        "length": 5100,
        "width": 1900,
        "height": 1450,
        "weight": 3000
      }
    ],
    "Trx300fwn": [
      {
        "years": "2000-2026",
        "length": 5100,
        "width": 1900,
        "height": 1450,
        "weight": 3000
      }
    ],
    "Trx400fw": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Trx400fwn": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Trx450es": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Trx400ex": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Rebel": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Nc700jd (nm4)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Nch50 (giorno)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Nch50 (metropolitan)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Nss300 (forza)": [
      {
        "years": "2000-2026",
        "length": 5100,
        "width": 1900,
        "height": 1450,
        "weight": 3000
      }
    ],
    "Trx450r/trx450er": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Msx125 (grom)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Vt1300 (sabre)": [
      {
        "years": "2000-2026",
        "length": 5100,
        "width": 1900,
        "height": 1450,
        "weight": 3000
      }
    ],
    "Cbr1000f": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Vt750 (shadow Aero 750)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Vt1300 (fury)": [
      {
        "years": "2000-2026",
        "length": 5100,
        "width": 1900,
        "height": 1450,
        "weight": 3000
      }
    ],
    "Vt750 (shadow Phantom 750)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Vt750 (shadow Ace 750)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Vt750 (shadow Tourer)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Silver Wing": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Elite 110": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Sh150d/sh150i": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Dn-01": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Varadero": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Trx450erb": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Chf50 (metropolitan)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Chf50 (jazz)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Gl1100 (goldwing)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Gl1200 (goldwing)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Vt1100 (shadow Spirit 1100)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Nrx1800 (valkyrie Rune)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Cg150esd": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Nsr50min": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Trx700ex": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Trx350fe": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Trx350fm": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Trx350te": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Trx350tm": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Trx400fa": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Trx450fm": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Nss250 (reflex)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Big Ruckus": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Vt600 (shadow Vlx Deluxe)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Ch80 (elite)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Cn250 (helix)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Cb900 (hornet)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Trx250 (recon)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Trx400fga": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Cb750 (nighthawk 750)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Cbr900/cbr954": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Cbr929rr": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Valkyrie": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Vt1100 (shadow Aero)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Gl1500c (valkyrie)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Gl1500cd (valkyrie Tourer)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Valkyrie Tourer": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Gl1500se (gold Wing Se)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Vt1100 (shadow Ace Tourer)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Vf750 (magna V45)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Gl1500a (gold Wing Aspencade)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Vt1100 (shadow Ace)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Trx400fg": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Cota": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Clarity": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Nq50 (spree)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Vt700 (shadow 700)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Nb50 (aero 50)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Vf500 (interceptor 500)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Tg50 (gyro S)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Cb700 (nighthawk S)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Vf1100 (magna V65)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Vt500 (shadow 500)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Vf1100 (sabre V65)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Vf1000f (interceptor 1000)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Nh80 (aero 80)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Vf700 (magna V42)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Nn50 (gyro)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Cmx300 (rebel 300)": [
      {
        "years": "2000-2026",
        "length": 5100,
        "width": 1900,
        "height": 1450,
        "weight": 3000
      }
    ],
    "Cmx500 (rebel 500)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Ncw50 (metropolitan)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Crf1000 (africa Twin)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Z125 (monkey)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Gl1800 (goldwing)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "C125 (super Cub)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Crf1100 (africa Twin)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Vt800 (shadow 800)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Vf500 (magna V30)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Vf750 (sabre V45)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Fireblade": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Ww150/pcx150": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Trx420 (rancher)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Trx500 (foreman)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Trx500 (foreman Rubicon)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Trx500 (rubicon)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Trail125": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Monkey": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Civic Si": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Navi": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Ruckus": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Vf700 (sabre V42)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Vf700 (interceptor 700)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Civic Type R": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Nu50 (urban Express)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Nc50 (express)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Prologue": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Ncw50 (giorno)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Crf125fb": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Crf150rb": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Crf250rx": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Crf450rx": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Crf450rwe": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Crf1000a": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Crf1000d": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Crf1000la": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Crf1000ld": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Crf150re": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Crf150rbe": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Crf250rb": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Crf450rb": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Crf250rl": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Crf250rla": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Crf250la": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Crf450rl": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Crf1100d": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Crf1100a": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Crf1100a4": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Crf1100d4": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Crf1000a2": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Crf1000d2": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Crf11004d": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Crf11004": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Crf1100ld": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Crf1100l": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Crf1100l4d": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Crf1100l4": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Crf1000as": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Crf1000asd": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Cbr600rr": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Cbr600ra": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Cbr500ra": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Cbr650fa": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Cbr1000rr": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Cbr1000ra": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Cbr1000s": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Cb1100sa": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Cbr250ra": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Cbr300ra": [
      {
        "years": "2000-2026",
        "length": 5100,
        "width": 1900,
        "height": 1450,
        "weight": 3000
      }
    ],
    "Cbr650ra": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Montesa Cota": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Africa Twin": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Fury": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Trx700 (rubicon 700)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Shadow Phantom": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Giorno": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Foreman": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Rubicon": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Foreman Rubicon": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Rancher": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Recon": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Rebel 1100": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Rebel 300": [
      {
        "years": "2000-2026",
        "length": 5100,
        "width": 1900,
        "height": 1450,
        "weight": 3000
      }
    ],
    "Rebel 500": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Shadow Aero": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Gold Wing Tour": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Grom": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Super Cub": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Sxs1000s (talon 1000)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Jazz": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Cb500 Hornet": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Vtr250 (interceptor 250)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Vtr1000f (super Hawk)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Vt1100 (shadow Sabre)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Vf750 (interceptor 750)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Cota 310rr": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Vt750 (shadow Spirit 750)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Vt500 (ascot)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Chf50p (metropolitan Ii)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Cb250 (nighthawk 250)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Nc750jd (nm4)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ]
  },
  "Acura": {
    "RSX": [
      {
        "years": "2002-2006",
        "length": 4374,
        "width": 1725,
        "height": 1394,
        "weight": 2629
      }
    ],
    "NSX": [
      {
        "years": "1991-2005",
        "length": 4404,
        "width": 1811,
        "height": 1171,
        "weight": 2335
      },
      {
        "years": "2017-2022",
        "length": 4470,
        "width": 1938,
        "height": 1214,
        "weight": 2629
      }
    ],
    "RDX": [
      {
        "years": "2007-2012",
        "length": 4590,
        "width": 1872,
        "height": 1656,
        "weight": 3000
      },
      {
        "years": "2013-2018",
        "length": 4684,
        "width": 1872,
        "height": 1651,
        "weight": 3000
      },
      {
        "years": "2019-2026",
        "length": 4760,
        "width": 1900,
        "height": 1669,
        "weight": 3000
      }
    ],
    "ILX": [
      {
        "years": "2013-2022",
        "length": 4620,
        "width": 1793,
        "height": 1412,
        "weight": 3000
      }
    ],
    "TSX": [
      {
        "years": "2004-2008",
        "length": 4656,
        "width": 1763,
        "height": 1455,
        "weight": 3000
      },
      {
        "years": "2009-2014",
        "length": 4724,
        "width": 1842,
        "height": 1440,
        "weight": 3000
      }
    ],
    "ADX": [
      {
        "years": "2025-2026",
        "length": 4719,
        "width": 1841,
        "height": 1621,
        "weight": 3000
      }
    ],
    "Integra": [
      {
        "years": "2023-2026",
        "length": 4719,
        "width": 1829,
        "height": 1410,
        "weight": 3000
      }
    ],
    "TL": [
      {
        "years": "2004-2008",
        "length": 4808,
        "width": 1834,
        "height": 1440,
        "weight": 3000
      },
      {
        "years": "2009-2014",
        "length": 4925,
        "width": 1880,
        "height": 1453,
        "weight": 3000
      }
    ],
    "TLX": [
      {
        "years": "2015-2020",
        "length": 4831,
        "width": 1854,
        "height": 1448,
        "weight": 3000
      },
      {
        "years": "2021-2026",
        "length": 4943,
        "width": 1910,
        "height": 1433,
        "weight": 3000
      }
    ],
    "ZDX": [
      {
        "years": "2010-2013",
        "length": 4887,
        "width": 1994,
        "height": 1595,
        "weight": 3000
      },
      {
        "years": "2024-2026",
        "length": 5022,
        "width": 1956,
        "height": 1636,
        "weight": 3000
      }
    ],
    "MDX": [
      {
        "years": "2007-2013",
        "length": 4844,
        "width": 1994,
        "height": 1732,
        "weight": 3000
      },
      {
        "years": "2014-2020",
        "length": 4917,
        "width": 1961,
        "height": 1717,
        "weight": 3000
      },
      {
        "years": "2022-2026",
        "length": 5039,
        "width": 1999,
        "height": 1725,
        "weight": 3000
      }
    ],
    "RLX": [
      {
        "years": "2014-2020",
        "length": 4981,
        "width": 1890,
        "height": 1466,
        "weight": 3000
      }
    ],
    "Legend": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "Vigor": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ]
  },
  "Mazda": {
    "Demio": [
      {
        "years": "1996-2002",
        "length": 3800,
        "width": 1670,
        "height": 1535,
        "weight": 2143
      },
      {
        "years": "2003-2007",
        "length": 3925,
        "width": 1680,
        "height": 1530,
        "weight": 2220
      }
    ],
    "MX-5 Miata": [
      {
        "years": "1990-1997",
        "length": 3970,
        "width": 1675,
        "height": 1230,
        "weight": 1799
      },
      {
        "years": "1999-2005",
        "length": 3945,
        "width": 1680,
        "height": 1225,
        "weight": 1786
      },
      {
        "years": "2006-2015",
        "length": 4000,
        "width": 1720,
        "height": 1245,
        "weight": 2141
      },
      {
        "years": "2016-2026",
        "length": 3915,
        "width": 1735,
        "height": 1230,
        "weight": 1838
      }
    ],
    "Mazda 2 Hatchback": [
      {
        "years": "2008-2014",
        "length": 3900,
        "width": 1695,
        "height": 1475,
        "weight": 2145
      },
      {
        "years": "2015-2026",
        "length": 4060,
        "width": 1695,
        "height": 1495,
        "weight": 2572
      }
    ],
    "CX-3": [
      {
        "years": "2015-2022",
        "length": 4275,
        "width": 1765,
        "height": 1535,
        "weight": 2896
      }
    ],
    "Mazda 2 Sedan": [
      {
        "years": "2011-2014",
        "length": 4270,
        "width": 1695,
        "height": 1475,
        "weight": 2669
      },
      {
        "years": "2015-2026",
        "length": 4340,
        "width": 1695,
        "height": 1470,
        "weight": 2703
      }
    ],
    "Protegé / Allegro": [
      {
        "years": "1995-1998",
        "length": 4340,
        "width": 1695,
        "height": 1420,
        "weight": 2611
      },
      {
        "years": "1999-2003",
        "length": 4420,
        "width": 1705,
        "height": 1410,
        "weight": 2656
      }
    ],
    "Mazda 3 Hatchback": [
      {
        "years": "2004-2009",
        "length": 4420,
        "width": 1755,
        "height": 1465,
        "weight": 2841
      },
      {
        "years": "2010-2013",
        "length": 4460,
        "width": 1755,
        "height": 1470,
        "weight": 2877
      },
      {
        "years": "2014-2018",
        "length": 4460,
        "width": 1795,
        "height": 1450,
        "weight": 2902
      },
      {
        "years": "2019-2026",
        "length": 4460,
        "width": 1795,
        "height": 1435,
        "weight": 2872
      }
    ],
    "CX-30": [
      {
        "years": "2020-2026",
        "length": 4395,
        "width": 1795,
        "height": 1540,
        "weight": 3000
      }
    ],
    "MX-30": [
      {
        "years": "2020-2026",
        "length": 4395,
        "width": 1795,
        "height": 1555,
        "weight": 3000
      }
    ],
    "CX-5": [
      {
        "years": "2013-2017",
        "length": 4555,
        "width": 1840,
        "height": 1670,
        "weight": 3000
      },
      {
        "years": "2017-2026",
        "length": 4550,
        "width": 1842,
        "height": 1680,
        "weight": 3000
      }
    ],
    "Mazda 3 Sedan": [
      {
        "years": "2004-2009",
        "length": 4510,
        "width": 1755,
        "height": 1465,
        "weight": 3000
      },
      {
        "years": "2010-2013",
        "length": 4580,
        "width": 1755,
        "height": 1470,
        "weight": 3000
      },
      {
        "years": "2014-2018",
        "length": 4580,
        "width": 1795,
        "height": 1450,
        "weight": 3000
      },
      {
        "years": "2019-2026",
        "length": 4660,
        "width": 1797,
        "height": 1440,
        "weight": 3000
      }
    ],
    "CX-7": [
      {
        "years": "2007-2012",
        "length": 4675,
        "width": 1870,
        "height": 1645,
        "weight": 3000
      }
    ],
    "Mazda 5": [
      {
        "years": "2006-2010",
        "length": 4505,
        "width": 1755,
        "height": 1615,
        "weight": 3000
      },
      {
        "years": "2012-2015",
        "length": 4585,
        "width": 1750,
        "height": 1615,
        "weight": 3000
      }
    ],
    "Mazda 6": [
      {
        "years": "2003-2008",
        "length": 4670,
        "width": 1780,
        "height": 1435,
        "weight": 3000
      },
      {
        "years": "2009-2012",
        "length": 4735,
        "width": 1795,
        "height": 1440,
        "weight": 3000
      },
      {
        "years": "2014-2024",
        "length": 4865,
        "width": 1840,
        "height": 1450,
        "weight": 3000
      }
    ],
    "CX-50": [
      {
        "years": "2023-2026",
        "length": 4725,
        "width": 1920,
        "height": 1645,
        "weight": 3000
      }
    ],
    "CX-60": [
      {
        "years": "2023-2026",
        "length": 4745,
        "width": 1890,
        "height": 1680,
        "weight": 3000
      }
    ],
    "B-Series (Cabina Sencilla)": [
      {
        "years": "1986-1997",
        "length": 4720,
        "width": 1670,
        "height": 1590,
        "weight": 3000
      },
      {
        "years": "1998-2006",
        "length": 4850,
        "width": 1750,
        "height": 1620,
        "weight": 3000
      }
    ],
    "B-Series (Doble Cabina)": [
      {
        "years": "1998-2006",
        "length": 4980,
        "width": 1750,
        "height": 1700,
        "weight": 3000
      }
    ],
    "CX-8": [
      {
        "years": "2017-2024",
        "length": 4900,
        "width": 1840,
        "height": 1730,
        "weight": 3000
      }
    ],
    "CX-9": [
      {
        "years": "2007-2015",
        "length": 5075,
        "width": 1955,
        "height": 1745,
        "weight": 3000
      },
      {
        "years": "2016-2023",
        "length": 5065,
        "width": 1969,
        "height": 1747,
        "weight": 3000
      }
    ],
    "CX-90": [
      {
        "years": "2024-2026",
        "length": 5120,
        "width": 1994,
        "height": 1732,
        "weight": 3000
      }
    ],
    "BT-50 (Cabina Sencilla)": [
      {
        "years": "2007-2011",
        "length": 5075,
        "width": 1715,
        "height": 1630,
        "weight": 3000
      },
      {
        "years": "2021-2026",
        "length": 5325,
        "width": 1810,
        "height": 1710,
        "weight": 3000
      }
    ],
    "BT-50 (Doble Cabina)": [
      {
        "years": "2007-2011",
        "length": 5085,
        "width": 1770,
        "height": 1760,
        "weight": 3000
      },
      {
        "years": "2012-2020",
        "length": 5275,
        "width": 1850,
        "height": 1795,
        "weight": 3000
      },
      {
        "years": "2021-2026",
        "length": 5285,
        "width": 1865,
        "height": 1850,
        "weight": 3000
      }
    ],
    "Tribute": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Mx-5": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Rx-8": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Mazda3": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Mazda5": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Mazda6": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Mazda2": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Protege": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Millenia": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Mx-3": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Rx-7": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Mx-6": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Navajo": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Cx-70": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ]
  },
  "Suzuki": {
    "Super Carry (Camioncito)": [
      {
        "years": "1985-2026",
        "length": 3240,
        "width": 1395,
        "height": 1765,
        "weight": 1755
      }
    ],
    "Samurai": [
      {
        "years": "1985-1995",
        "length": 3430,
        "width": 1540,
        "height": 1665,
        "weight": 1935
      }
    ],
    "Alto": [
      {
        "years": "2009-2014",
        "length": 3495,
        "width": 1475,
        "height": 1460,
        "weight": 1656
      },
      {
        "years": "2015-2026",
        "length": 3445,
        "width": 1490,
        "height": 1475,
        "weight": 1666
      }
    ],
    "S-Presso": [
      {
        "years": "2020-2026",
        "length": 3565,
        "width": 1520,
        "height": 1565,
        "weight": 1866
      }
    ],
    "Celerio": [
      {
        "years": "2014-2021",
        "length": 3600,
        "width": 1600,
        "height": 1540,
        "weight": 1951
      },
      {
        "years": "2022-2026",
        "length": 3695,
        "width": 1655,
        "height": 1555,
        "weight": 2092
      }
    ],
    "Jimny (3 puertas)": [
      {
        "years": "1998-2018",
        "length": 3625,
        "width": 1600,
        "height": 1670,
        "weight": 2131
      },
      {
        "years": "2019-2026",
        "length": 3645,
        "width": 1645,
        "height": 1720,
        "weight": 2269
      }
    ],
    "Sidekick (3 puertas)": [
      {
        "years": "1989-1998",
        "length": 3620,
        "width": 1630,
        "height": 1665,
        "weight": 2161
      }
    ],
    "Ignis": [
      {
        "years": "2017-2024",
        "length": 3700,
        "width": 1660,
        "height": 1595,
        "weight": 2155
      }
    ],
    "Swift": [
      {
        "years": "1989-2004",
        "length": 3710,
        "width": 1590,
        "height": 1350,
        "weight": 1752
      },
      {
        "years": "2005-2010",
        "length": 3695,
        "width": 1690,
        "height": 1500,
        "weight": 2061
      },
      {
        "years": "2011-2017",
        "length": 3850,
        "width": 1695,
        "height": 1510,
        "weight": 2168
      },
      {
        "years": "2018-2026",
        "length": 3845,
        "width": 1735,
        "height": 1495,
        "weight": 2194
      }
    ],
    "Baleno Hatchback": [
      {
        "years": "2016-2026",
        "length": 3990,
        "width": 1745,
        "height": 1500,
        "weight": 2298
      }
    ],
    "Jimny (5 puertas)": [
      {
        "years": "2023-2026",
        "length": 3985,
        "width": 1645,
        "height": 1720,
        "weight": 2481
      }
    ],
    "Fronx": [
      {
        "years": "2023-2026",
        "length": 3995,
        "width": 1765,
        "height": 1550,
        "weight": 2404
      }
    ],
    "Dzire": [
      {
        "years": "2017-2026",
        "length": 3995,
        "width": 1735,
        "height": 1515,
        "weight": 2310
      }
    ],
    "Vitara (3 puertas)": [
      {
        "years": "1998-2005",
        "length": 3880,
        "width": 1695,
        "height": 1685,
        "weight": 2438
      }
    ],
    "Vitara (5 puertas)": [
      {
        "years": "1998-2005",
        "length": 4025,
        "width": 1780,
        "height": 1755,
        "weight": 3000
      },
      {
        "years": "2015-2022",
        "length": 4175,
        "width": 1775,
        "height": 1610,
        "weight": 2983
      },
      {
        "years": "2023-2026",
        "length": 4228,
        "width": 1790,
        "height": 1610,
        "weight": 3000
      }
    ],
    "Sidekick (5 puertas)": [
      {
        "years": "1991-1998",
        "length": 4125,
        "width": 1695,
        "height": 1695,
        "weight": 2963
      }
    ],
    "SX4 Hatchback": [
      {
        "years": "2007-2014",
        "length": 4135,
        "width": 1755,
        "height": 1620,
        "weight": 2939
      }
    ],
    "SX4 Sedan": [
      {
        "years": "2007-2014",
        "length": 4490,
        "width": 1730,
        "height": 1545,
        "weight": 3000
      }
    ],
    "S-Cross": [
      {
        "years": "2014-2021",
        "length": 4300,
        "width": 1765,
        "height": 1575,
        "weight": 2988
      },
      {
        "years": "2022-2026",
        "length": 4300,
        "width": 1785,
        "height": 1580,
        "weight": 3000
      }
    ],
    "APV": [
      {
        "years": "2005-2026",
        "length": 4230,
        "width": 1655,
        "height": 1860,
        "weight": 3000
      }
    ],
    "Ertiga": [
      {
        "years": "2012-2018",
        "length": 4265,
        "width": 1695,
        "height": 1685,
        "weight": 3000
      },
      {
        "years": "2019-2026",
        "length": 4395,
        "width": 1735,
        "height": 1690,
        "weight": 3000
      }
    ],
    "Grand Vitara (3 puertas)": [
      {
        "years": "2006-2014",
        "length": 4005,
        "width": 1810,
        "height": 1695,
        "weight": 3000
      }
    ],
    "Grand Vitara (5 puertas)": [
      {
        "years": "1998-2005",
        "length": 4195,
        "width": 1780,
        "height": 1740,
        "weight": 3000
      },
      {
        "years": "2006-2014",
        "length": 4500,
        "width": 1810,
        "height": 1695,
        "weight": 3000
      },
      {
        "years": "2023-2026",
        "length": 4375,
        "width": 1795,
        "height": 1645,
        "weight": 3000
      }
    ],
    "Ciaz": [
      {
        "years": "2015-2024",
        "length": 4490,
        "width": 1730,
        "height": 1485,
        "weight": 2884
      }
    ],
    "XL7": [
      {
        "years": "2020-2026",
        "length": 4450,
        "width": 1775,
        "height": 1710,
        "weight": 3000
      }
    ],
    "An400 / An400s": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Dr-z400sl": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Dr650sel": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Sv650/sv650s/sv650sf": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Vz800/vz800z": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Vl800 / Vl800t / Vl800c/vl800b": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Sv1000 / Sv1000s": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Vs1400/vs1400gl": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Vl1500 / Vl1500t": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Vzr1800/vzr1800z/vzr1800n": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Lt-z50/lt-z50z": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Lt-z250/ Lt-z250z": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Lt-f400f": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Lt-z400l/lt-z400zl": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Lt-r450/lt-r450z": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Lt-f500f": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Lt-a500f": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Aerio": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Equator": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Kizashi": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Dr-z70": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Dr-z125l": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Dr-z125ll": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Dr-z250": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Dr-z400e": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Rm-z250l": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Rm250/ Rm250t": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Rm-z450l": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Lt-z90l": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Lt-f400": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Lt-a400": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Lt-a450x": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Sv650a/sv650sa/sv650saf": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Vlr1800/vlr1800t": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Vl1500l/vl1500bl/vl1500tl/vl1500btl": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Dl1000a/dl1000aa": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Forenza": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Reno": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Vitara": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Sidekick": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "X-90": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Gn125e/ Gn125et": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Vzr1800bzl": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Vl1500bl/vl1500tl": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Vl800l/vl800tl": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Gw250fl/gw250zl": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Dr-z400sml": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Dl650xa/dl650a": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Gw250/gw250f/gw250z": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Lt-a50": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Lt-f160": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Lt-f250l": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Lt-f250f": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Lt-f300f": [
      {
        "years": "2000-2026",
        "length": 5100,
        "width": 1900,
        "height": 1450,
        "weight": 3000
      }
    ],
    "Lt-z400l": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Sv650/sv650s": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Vs1400glp": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Dr-z400": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Dr-z110": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Grand Vitara": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Grand Vitara Xl-7": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Verona": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Sv650al7": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Dl650xal7": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Dl650xal/dl650aal/dl650al": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Dl1000al/dl1000aal": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Dl650aal/dl650al": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Vzr1800bzl/vzr1800l/vzr1800zl": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Vl800bl/vl800cl/vl800l/vl800tl": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Dr200sel": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Vl800cl/vl800l/vl800tl": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Vzr1800l/vzr1800zl": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Lt-a500": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Lt-f250": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Lt-f400fu": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Lt-r450": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Lt-r450z": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Lt-z400/lt-z400z": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Lt-z90": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Rm-z250": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Rm-z450": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Dr-z400s": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Dr-z125": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Vl800/vl800c/vl800t": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Vzr1800/vzr1800z": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Lt-f500f/quadrunner": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Lt-z250": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Lt-z50": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Vz800/vz800b/vz800z": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Sv650a/sv650sa": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Lt-z250k": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Lt-f400f/lt-f400fc": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Lt-a400f/lt-a400fc/lt-a400fh": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Lt-a500f/lt-a500fc": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Lt-a400f/lt-a400fz": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Lt-z400z": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Vl800/vl800t/vl800z": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Lt-v700f": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Vs800glk": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Vs1400glpk": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Dr200sek": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Dr-z400sk": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Dr650sek": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Dr-z125k": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Dr-z125lk": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Dr-z250k": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Dr-z400k": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Dr-z400ek": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Lt-f250fk": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Lt-f250k": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Lt-f400k": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Lt-a400k": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Lt-f400fk": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Lt-a400fk": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Lt-z400k": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Lt-f500fk": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Lt-a500fk": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Dr-z110k": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Rm-z250k": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Sv650k/sv650sk": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Tl1000rk": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Sv1000k / Sv1000sk": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Lt-f4wdx": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Lt-f4wd": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Low Speed Vehicle": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Gv1200gl": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Family": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Touring": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Leisure": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Enduro": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Off Road Play": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Mini-leisure": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Moto-cross": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Ls650bl7": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Boulevard M109r B.o.s.s.(vzr1800bzl8)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Boulevard M90(vz1500l8)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Boulevard M50(vz800l8)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Boulevard S40(ls650bl8 )": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Tu250xl8": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Sv650al8": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Boulevard C90 B.o.s.s. (vl1500bl8)  / Boulevard C90t(vl1500tl8)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Boulevard C50(vl800l8) / Boulevard C50t(vl800tl8)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Dr650sel8": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Dr-z400sl8": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Dr200sl8": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Dr-z400sml8": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Burgman 650": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Boulevard M109r B.o.s.s. (vzr1800bzl9)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Boulevard M90 (vz1500l9)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Boulevard M50 (vz800l9)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Boulevard C90 B.o.s.s. (vl1500bl9) / Boulevard C90t (vl1500tl9)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Boulevard C50 (vl800l9) / Boulevard C50t (vl800tl9)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Boulevard S40 (ls650bl9)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Tu250xl9": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Sv650al9 / Sv650xal9": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Dr650sel9": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Dr-z400sl9": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Dr200sl9": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Dr-z400sml9": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Rmx450zl": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Dr-z125ll/dr-z125l": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Lt-z50l": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Boulevard C50t": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Burgman 400": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Burgman 200": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Vs750 Intruder": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Dr-z400sm": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Suzuki Boulevard M109r B.o.s.s.": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Uh200am2": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Boulevard": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Dr-z50": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Katana": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Dr-z12lm": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Kingquad": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Dr-z4s": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ]
  },
  "Mitsubishi": {
    "i-MiEV": [
      {
        "years": "2010-2021",
        "length": 3475,
        "width": 1475,
        "height": 1610,
        "weight": 1815
      }
    ],
    "Montero iO (3 puertas)": [
      {
        "years": "1998-2007",
        "length": 3675,
        "width": 1680,
        "height": 1700,
        "weight": 2309
      }
    ],
    "Space Star": [
      {
        "years": "2013-2026",
        "length": 3710,
        "width": 1665,
        "height": 1490,
        "weight": 2025
      }
    ],
    "Mirage Hatchback": [
      {
        "years": "2013-2026",
        "length": 3845,
        "width": 1665,
        "height": 1510,
        "weight": 2127
      }
    ],
    "Colt": [
      {
        "years": "2004-2012",
        "length": 3871,
        "width": 1699,
        "height": 1550,
        "weight": 2243
      }
    ],
    "Montero iO (5 puertas)": [
      {
        "years": "1998-2007",
        "length": 3975,
        "width": 1680,
        "height": 1700,
        "weight": 2498
      }
    ],
    "Pajero / Montero (3 puertas)": [
      {
        "years": "1991-2000",
        "length": 4030,
        "width": 1695,
        "height": 1845,
        "weight": 3000
      },
      {
        "years": "2001-2006",
        "length": 4220,
        "width": 1875,
        "height": 1845,
        "weight": 3000
      },
      {
        "years": "2007-2021",
        "length": 4385,
        "width": 1875,
        "height": 1850,
        "weight": 3000
      }
    ],
    "ASX": [
      {
        "years": "2010-2019",
        "length": 4295,
        "width": 1770,
        "height": 1625,
        "weight": 3000
      },
      {
        "years": "2020-2026",
        "length": 4370,
        "width": 1800,
        "height": 1630,
        "weight": 3000
      }
    ],
    "Mirage G4 (Sedan)": [
      {
        "years": "2014-2026",
        "length": 4305,
        "width": 1670,
        "height": 1515,
        "weight": 2723
      }
    ],
    "Eclipse (Coupe)": [
      {
        "years": "1995-1999",
        "length": 4380,
        "width": 1745,
        "height": 1295,
        "weight": 2474
      },
      {
        "years": "2000-2005",
        "length": 4488,
        "width": 1750,
        "height": 1310,
        "weight": 2572
      },
      {
        "years": "2006-2012",
        "length": 4565,
        "width": 1835,
        "height": 1358,
        "weight": 3000
      }
    ],
    "Xforce": [
      {
        "years": "2024-2026",
        "length": 4390,
        "width": 1810,
        "height": 1660,
        "weight": 3000
      }
    ],
    "Eclipse Cross": [
      {
        "years": "2018-2021",
        "length": 4405,
        "width": 1805,
        "height": 1685,
        "weight": 3000
      },
      {
        "years": "2022-2026",
        "length": 4545,
        "width": 1805,
        "height": 1685,
        "weight": 3000
      }
    ],
    "Lancer": [
      {
        "years": "1992-1996",
        "length": 4275,
        "width": 1690,
        "height": 1385,
        "weight": 2502
      },
      {
        "years": "1997-2001",
        "length": 4410,
        "width": 1690,
        "height": 1390,
        "weight": 2590
      },
      {
        "years": "2002-2007",
        "length": 4495,
        "width": 1695,
        "height": 1375,
        "weight": 2619
      },
      {
        "years": "2008-2017",
        "length": 4570,
        "width": 1760,
        "height": 1490,
        "weight": 3000
      }
    ],
    "Lancer Evolution": [
      {
        "years": "1998-2006",
        "length": 4455,
        "width": 1770,
        "height": 1450,
        "weight": 2858
      },
      {
        "years": "2008-2016",
        "length": 4505,
        "width": 1810,
        "height": 1480,
        "weight": 3000
      }
    ],
    "Outlander": [
      {
        "years": "2003-2006",
        "length": 4475,
        "width": 1750,
        "height": 1620,
        "weight": 3000
      },
      {
        "years": "2007-2012",
        "length": 4640,
        "width": 1800,
        "height": 1680,
        "weight": 3000
      },
      {
        "years": "2013-2021",
        "length": 4695,
        "width": 1800,
        "height": 1710,
        "weight": 3000
      },
      {
        "years": "2022-2026",
        "length": 4710,
        "width": 1862,
        "height": 1745,
        "weight": 3000
      }
    ],
    "3000GT": [
      {
        "years": "1990-2000",
        "length": 4580,
        "width": 1840,
        "height": 1285,
        "weight": 3000
      }
    ],
    "Xpander": [
      {
        "years": "2018-2021",
        "length": 4475,
        "width": 1750,
        "height": 1700,
        "weight": 3000
      },
      {
        "years": "2022-2026",
        "length": 4595,
        "width": 1750,
        "height": 1750,
        "weight": 3000
      }
    ],
    "Montero Sport": [
      {
        "years": "1997-2008",
        "length": 4610,
        "width": 1775,
        "height": 1735,
        "weight": 3000
      },
      {
        "years": "2009-2015",
        "length": 4695,
        "width": 1815,
        "height": 1800,
        "weight": 3000
      },
      {
        "years": "2016-2026",
        "length": 4825,
        "width": 1815,
        "height": 1835,
        "weight": 3000
      }
    ],
    "Galant": [
      {
        "years": "1996-2003",
        "length": 4630,
        "width": 1740,
        "height": 1420,
        "weight": 3000
      },
      {
        "years": "2004-2012",
        "length": 4840,
        "width": 1840,
        "height": 1470,
        "weight": 3000
      }
    ],
    "Grandis": [
      {
        "years": "2003-2011",
        "length": 4765,
        "width": 1795,
        "height": 1655,
        "weight": 3000
      }
    ],
    "Endeavor": [
      {
        "years": "2004-2011",
        "length": 4846,
        "width": 1870,
        "height": 1768,
        "weight": 3000
      }
    ],
    "Montero / Pajero (5 puertas)": [
      {
        "years": "1991-2000",
        "length": 4725,
        "width": 1775,
        "height": 1900,
        "weight": 3000
      },
      {
        "years": "2001-2006",
        "length": 4830,
        "width": 1895,
        "height": 1885,
        "weight": 3000
      },
      {
        "years": "2007-2021",
        "length": 4900,
        "width": 1875,
        "height": 1870,
        "weight": 3000
      }
    ],
    "L200 (Cabina Sencilla)": [
      {
        "years": "1996-2005",
        "length": 4920,
        "width": 1695,
        "height": 1710,
        "weight": 3000
      },
      {
        "years": "2006-2014",
        "length": 5040,
        "width": 1750,
        "height": 1775,
        "weight": 3000
      },
      {
        "years": "2015-2026",
        "length": 5270,
        "width": 1815,
        "height": 1780,
        "weight": 3000
      }
    ],
    "L200 (Doble Cabina)": [
      {
        "years": "1996-2005",
        "length": 5000,
        "width": 1695,
        "height": 1800,
        "weight": 3000
      },
      {
        "years": "2006-2014",
        "length": 5115,
        "width": 1750,
        "height": 1775,
        "weight": 3000
      },
      {
        "years": "2015-2023",
        "length": 5225,
        "width": 1815,
        "height": 1775,
        "weight": 3000
      },
      {
        "years": "2024-2026",
        "length": 5360,
        "width": 1930,
        "height": 1820,
        "weight": 3000
      }
    ],
    "Rosa": [
      {
        "years": "1990-2026",
        "length": 6990,
        "width": 2065,
        "height": 2720,
        "weight": 3000
      }
    ],
    "Raider": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Eclipse": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Montero": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Mirage": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Expo": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Diamante": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Truck": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Mirage G4": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Precis": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Space Wagon": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Wagon": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Sigma": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Van": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Tredia": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Cordia": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Mighty Max": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Fec7us / Ecanter": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Fe140 (feczts)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Fe160 (fec7ts)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Fe180 (fec9ts)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Fe160 (fec7tw)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Low Speed Vehicle": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ]
  },
  "Subaru": {
    "Vivio": [
      {
        "years": "1992-1998",
        "length": 3295,
        "width": 1395,
        "height": 1375,
        "weight": 1390
      }
    ],
    "Rex": [
      {
        "years": "1987-1992",
        "length": 3295,
        "width": 1395,
        "height": 1400,
        "weight": 1416
      },
      {
        "years": "2023-2026",
        "length": 3995,
        "width": 1695,
        "height": 1620,
        "weight": 2413
      }
    ],
    "Justy": [
      {
        "years": "1984-1994",
        "length": 3535,
        "width": 1535,
        "height": 1390,
        "weight": 1659
      },
      {
        "years": "1995-2003",
        "length": 3745,
        "width": 1590,
        "height": 1380,
        "weight": 1808
      },
      {
        "years": "2007-2011",
        "length": 3610,
        "width": 1665,
        "height": 1540,
        "weight": 2036
      }
    ],
    "BRZ": [
      {
        "years": "2012-2021",
        "length": 4240,
        "width": 1775,
        "height": 1285,
        "weight": 2418
      },
      {
        "years": "2022-2026",
        "length": 4265,
        "width": 1775,
        "height": 1310,
        "weight": 2479
      }
    ],
    "Impreza Hatchback": [
      {
        "years": "1993-2000",
        "length": 4350,
        "width": 1690,
        "height": 1440,
        "weight": 2647
      },
      {
        "years": "2001-2007",
        "length": 4415,
        "width": 1740,
        "height": 1475,
        "weight": 2833
      },
      {
        "years": "2008-2011",
        "length": 4415,
        "width": 1740,
        "height": 1475,
        "weight": 2833
      },
      {
        "years": "2012-2016",
        "length": 4415,
        "width": 1740,
        "height": 1465,
        "weight": 2814
      },
      {
        "years": "2017-2023",
        "length": 4460,
        "width": 1775,
        "height": 1480,
        "weight": 2929
      },
      {
        "years": "2024-2026",
        "length": 4470,
        "width": 1780,
        "height": 1480,
        "weight": 2944
      }
    ],
    "Impreza Sedan": [
      {
        "years": "1993-2000",
        "length": 4375,
        "width": 1690,
        "height": 1410,
        "weight": 2606
      },
      {
        "years": "2001-2007",
        "length": 4415,
        "width": 1740,
        "height": 1440,
        "weight": 2766
      },
      {
        "years": "2008-2011",
        "length": 4580,
        "width": 1740,
        "height": 1475,
        "weight": 3000
      },
      {
        "years": "2012-2016",
        "length": 4580,
        "width": 1740,
        "height": 1465,
        "weight": 3000
      },
      {
        "years": "2017-2023",
        "length": 4625,
        "width": 1775,
        "height": 1455,
        "weight": 3000
      }
    ],
    "XV": [
      {
        "years": "2012-2017",
        "length": 4450,
        "width": 1800,
        "height": 1615,
        "weight": 3000
      },
      {
        "years": "2018-2023",
        "length": 4465,
        "width": 1800,
        "height": 1615,
        "weight": 3000
      }
    ],
    "Crosstrek": [
      {
        "years": "2012-2023",
        "length": 4465,
        "width": 1800,
        "height": 1615,
        "weight": 3000
      },
      {
        "years": "2024-2026",
        "length": 4480,
        "width": 1800,
        "height": 1620,
        "weight": 3000
      }
    ],
    "Loyale": [
      {
        "years": "1984-1994",
        "length": 4370,
        "width": 1660,
        "height": 1430,
        "weight": 2593
      }
    ],
    "WRX": [
      {
        "years": "2014-2021",
        "length": 4595,
        "width": 1795,
        "height": 1475,
        "weight": 3000
      },
      {
        "years": "2022-2026",
        "length": 4670,
        "width": 1825,
        "height": 1465,
        "weight": 3000
      }
    ],
    "STI": [
      {
        "years": "2004-2021",
        "length": 4605,
        "width": 1795,
        "height": 1475,
        "weight": 3000
      }
    ],
    "Forester": [
      {
        "years": "1998-2002",
        "length": 4450,
        "width": 1735,
        "height": 1590,
        "weight": 3000
      },
      {
        "years": "2003-2008",
        "length": 4485,
        "width": 1735,
        "height": 1590,
        "weight": 3000
      },
      {
        "years": "2009-2013",
        "length": 4560,
        "width": 1780,
        "height": 1710,
        "weight": 3000
      },
      {
        "years": "2014-2018",
        "length": 4595,
        "width": 1795,
        "height": 1715,
        "weight": 3000
      },
      {
        "years": "2019-2026",
        "length": 4625,
        "width": 1815,
        "height": 1730,
        "weight": 3000
      }
    ],
    "Solterra": [
      {
        "years": "2023-2026",
        "length": 4690,
        "width": 1860,
        "height": 1650,
        "weight": 3000
      }
    ],
    "Legacy Sedan": [
      {
        "years": "1990-2003",
        "length": 4605,
        "width": 1695,
        "height": 1410,
        "weight": 3000
      },
      {
        "years": "2004-2009",
        "length": 4665,
        "width": 1730,
        "height": 1430,
        "weight": 3000
      },
      {
        "years": "2010-2014",
        "length": 4730,
        "width": 1780,
        "height": 1500,
        "weight": 3000
      },
      {
        "years": "2015-2019",
        "length": 4790,
        "width": 1840,
        "height": 1500,
        "weight": 3000
      },
      {
        "years": "2020-2026",
        "length": 4840,
        "width": 1840,
        "height": 1500,
        "weight": 3000
      }
    ],
    "Legacy Station Wagon": [
      {
        "years": "1990-2003",
        "length": 4680,
        "width": 1695,
        "height": 1470,
        "weight": 3000
      },
      {
        "years": "2004-2009",
        "length": 4795,
        "width": 1730,
        "height": 1475,
        "weight": 3000
      }
    ],
    "Outback": [
      {
        "years": "1995-2004",
        "length": 4720,
        "width": 1745,
        "height": 1580,
        "weight": 3000
      },
      {
        "years": "2005-2009",
        "length": 4730,
        "width": 1770,
        "height": 1605,
        "weight": 3000
      },
      {
        "years": "2010-2014",
        "length": 4800,
        "width": 1820,
        "height": 1670,
        "weight": 3000
      },
      {
        "years": "2015-2019",
        "length": 4815,
        "width": 1840,
        "height": 1670,
        "weight": 3000
      },
      {
        "years": "2020-2026",
        "length": 4870,
        "width": 1875,
        "height": 1675,
        "weight": 3000
      }
    ],
    "Baja": [
      {
        "years": "2003-2006",
        "length": 4910,
        "width": 1780,
        "height": 1630,
        "weight": 3000
      }
    ],
    "Tribeca": [
      {
        "years": "2006-2014",
        "length": 4865,
        "width": 1880,
        "height": 1685,
        "weight": 3000
      }
    ],
    "Ascent": [
      {
        "years": "2019-2026",
        "length": 4998,
        "width": 1930,
        "height": 1819,
        "weight": 3000
      }
    ],
    "Evoltis": [
      {
        "years": "2019-2026",
        "length": 4998,
        "width": 1930,
        "height": 1819,
        "weight": 3000
      }
    ],
    "Legacy": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Impreza": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "B9 Tribeca": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Brat": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Gl-10": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Trailseeker": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ]
  },
  "Isuzu": {
    "Rodeo": [
      {
        "years": "1998-2004",
        "length": 4509,
        "width": 1788,
        "height": 1745,
        "weight": 3000
      }
    ],
    "Trooper": [
      {
        "years": "1992-2002",
        "length": 4795,
        "width": 1835,
        "height": 1840,
        "weight": 3000
      }
    ],
    "MU-X": [
      {
        "years": "2013-2020",
        "length": 4825,
        "width": 1860,
        "height": 1825,
        "weight": 3000
      },
      {
        "years": "2021-2026",
        "length": 4850,
        "width": 1870,
        "height": 1815,
        "weight": 3000
      }
    ],
    "D-Max": [
      {
        "years": "2002-2011",
        "length": 4900,
        "width": 1720,
        "height": 1735,
        "weight": 3000
      },
      {
        "years": "2012-2019",
        "length": 5295,
        "width": 1860,
        "height": 1795,
        "weight": 3000
      },
      {
        "years": "2020-2026",
        "length": 5285,
        "width": 1870,
        "height": 1810,
        "weight": 3000
      }
    ],
    "Vehicross": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Npr/npr-hd": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Ascender": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Oasis": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Axiom": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Rodeo/amigo": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "I-280": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Hombre": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "I-mark": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Ftr/fvr/evr": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Trooper Ii": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Amigo": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Npr-hd": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Npr-xd": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "I-350": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "I-290": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "I-370": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ]
  },
  "Hyundai": {
    "Atos": [
      {
        "years": "2000-2013",
        "length": 3495,
        "width": 1495,
        "height": 1580,
        "weight": 1816
      },
      {
        "years": "2019-2023",
        "length": 3610,
        "width": 1645,
        "height": 1560,
        "weight": 2038
      }
    ],
    "Eon": [
      {
        "years": "2012-2019",
        "length": 3495,
        "width": 1550,
        "height": 1500,
        "weight": 1788
      }
    ],
    "Grand i10 Hatchback": [
      {
        "years": "2014-2019",
        "length": 3765,
        "width": 1660,
        "height": 1520,
        "weight": 2090
      },
      {
        "years": "2020-2026",
        "length": 3815,
        "width": 1680,
        "height": 1510,
        "weight": 2129
      }
    ],
    "Grand i10 Sedan": [
      {
        "years": "2014-2019",
        "length": 3995,
        "width": 1660,
        "height": 1520,
        "weight": 2218
      },
      {
        "years": "2020-2026",
        "length": 3995,
        "width": 1680,
        "height": 1510,
        "weight": 2230
      }
    ],
    "Inster": [
      {
        "years": "2024-2026",
        "length": 3825,
        "width": 1610,
        "height": 1575,
        "weight": 2134
      }
    ],
    "Getz": [
      {
        "years": "2002-2011",
        "length": 3825,
        "width": 1665,
        "height": 1490,
        "weight": 2088
      }
    ],
    "HB20 Hatchback": [
      {
        "years": "2020-2022",
        "length": 3940,
        "width": 1720,
        "height": 1470,
        "weight": 2192
      },
      {
        "years": "2023-2026",
        "length": 4015,
        "width": 1720,
        "height": 1470,
        "weight": 2538
      }
    ],
    "HB20S (Sedan)": [
      {
        "years": "2020-2022",
        "length": 4260,
        "width": 1720,
        "height": 1470,
        "weight": 2693
      },
      {
        "years": "2023-2026",
        "length": 4325,
        "width": 1720,
        "height": 1470,
        "weight": 2734
      }
    ],
    "i20": [
      {
        "years": "2015-2020",
        "length": 3985,
        "width": 1734,
        "height": 1485,
        "weight": 2257
      },
      {
        "years": "2021-2026",
        "length": 4040,
        "width": 1775,
        "height": 1450,
        "weight": 2599
      }
    ],
    "i20 Active": [
      {
        "years": "2016-2021",
        "length": 3995,
        "width": 1760,
        "height": 1555,
        "weight": 2405
      }
    ],
    "Venue": [
      {
        "years": "2020-2026",
        "length": 4040,
        "width": 1770,
        "height": 1590,
        "weight": 2842
      }
    ],
    "Excel": [
      {
        "years": "1990-1994",
        "length": 4275,
        "width": 1605,
        "height": 1365,
        "weight": 2341
      }
    ],
    "Accent Hatchback": [
      {
        "years": "1995-1999",
        "length": 4100,
        "width": 1620,
        "height": 1395,
        "weight": 2316
      },
      {
        "years": "2000-2005",
        "length": 4200,
        "width": 1670,
        "height": 1395,
        "weight": 2446
      },
      {
        "years": "2006-2010",
        "length": 4045,
        "width": 1695,
        "height": 1470,
        "weight": 2520
      },
      {
        "years": "2011-2017",
        "length": 4115,
        "width": 1700,
        "height": 1450,
        "weight": 2536
      }
    ],
    "Accent Sedan": [
      {
        "years": "1995-1999",
        "length": 4115,
        "width": 1620,
        "height": 1395,
        "weight": 2325
      },
      {
        "years": "2000-2005",
        "length": 4235,
        "width": 1670,
        "height": 1395,
        "weight": 2467
      },
      {
        "years": "2006-2010",
        "length": 4280,
        "width": 1695,
        "height": 1470,
        "weight": 2666
      },
      {
        "years": "2011-2017",
        "length": 4370,
        "width": 1700,
        "height": 1450,
        "weight": 2693
      },
      {
        "years": "2018-2022",
        "length": 4385,
        "width": 1729,
        "height": 1460,
        "weight": 2767
      },
      {
        "years": "2023-2026",
        "length": 4535,
        "width": 1765,
        "height": 1475,
        "weight": 3000
      }
    ],
    "Verna": [
      {
        "years": "2000-2005",
        "length": 4235,
        "width": 1670,
        "height": 1395,
        "weight": 2467
      }
    ],
    "Veloster": [
      {
        "years": "2011-2017",
        "length": 4220,
        "width": 1790,
        "height": 1399,
        "weight": 2642
      },
      {
        "years": "2018-2022",
        "length": 4240,
        "width": 1800,
        "height": 1400,
        "weight": 2671
      }
    ],
    "Kona": [
      {
        "years": "2018-2022",
        "length": 4165,
        "width": 1800,
        "height": 1550,
        "weight": 2905
      },
      {
        "years": "2023-2026",
        "length": 4350,
        "width": 1825,
        "height": 1570,
        "weight": 3000
      }
    ],
    "Creta": [
      {
        "years": "2016-2020",
        "length": 4270,
        "width": 1790,
        "height": 1635,
        "weight": 3000
      },
      {
        "years": "2021-2026",
        "length": 4300,
        "width": 1790,
        "height": 1635,
        "weight": 3000
      }
    ],
    "i30": [
      {
        "years": "2007-2011",
        "length": 4245,
        "width": 1775,
        "height": 1480,
        "weight": 2788
      },
      {
        "years": "2012-2016",
        "length": 4300,
        "width": 1780,
        "height": 1470,
        "weight": 2813
      },
      {
        "years": "2017-2024",
        "length": 4340,
        "width": 1795,
        "height": 1455,
        "weight": 2834
      }
    ],
    "Tucson": [
      {
        "years": "2005-2009",
        "length": 4325,
        "width": 1795,
        "height": 1730,
        "weight": 3000
      },
      {
        "years": "2010-2015",
        "length": 4410,
        "width": 1820,
        "height": 1655,
        "weight": 3000
      },
      {
        "years": "2016-2020",
        "length": 4475,
        "width": 1850,
        "height": 1645,
        "weight": 3000
      },
      {
        "years": "2021-2026",
        "length": 4500,
        "width": 1865,
        "height": 1650,
        "weight": 3000
      }
    ],
    "ix35": [
      {
        "years": "2010-2015",
        "length": 4410,
        "width": 1820,
        "height": 1655,
        "weight": 3000
      }
    ],
    "Creta Grand": [
      {
        "years": "2022-2026",
        "length": 4500,
        "width": 1790,
        "height": 1675,
        "weight": 3000
      }
    ],
    "Galloper": [
      {
        "years": "1991-2003",
        "length": 4035,
        "width": 1680,
        "height": 1840,
        "weight": 3000
      },
      {
        "years": "1991-2003",
        "length": 4635,
        "width": 1680,
        "height": 1840,
        "weight": 3000
      }
    ],
    "Elantra Hatchback / GT": [
      {
        "years": "2001-2006",
        "length": 4520,
        "width": 1720,
        "height": 1425,
        "weight": 3000
      },
      {
        "years": "2013-2017",
        "length": 4300,
        "width": 1780,
        "height": 1470,
        "weight": 2813
      }
    ],
    "Elantra Sedan": [
      {
        "years": "1991-1995",
        "length": 4375,
        "width": 1675,
        "height": 1395,
        "weight": 2556
      },
      {
        "years": "1996-2000",
        "length": 4420,
        "width": 1700,
        "height": 1395,
        "weight": 2621
      },
      {
        "years": "2001-2006",
        "length": 4520,
        "width": 1720,
        "height": 1425,
        "weight": 3000
      },
      {
        "years": "2007-2010",
        "length": 4505,
        "width": 1775,
        "height": 1480,
        "weight": 3000
      },
      {
        "years": "2011-2015",
        "length": 4560,
        "width": 1775,
        "height": 1440,
        "weight": 3000
      },
      {
        "years": "2016-2020",
        "length": 4570,
        "width": 1800,
        "height": 1450,
        "weight": 3000
      },
      {
        "years": "2021-2026",
        "length": 4680,
        "width": 1825,
        "height": 1415,
        "weight": 3000
      }
    ],
    "Avante": [
      {
        "years": "2011-2026",
        "length": 4680,
        "width": 1825,
        "height": 1415,
        "weight": 3000
      }
    ],
    "Ioniq Hatchback": [
      {
        "years": "2017-2022",
        "length": 4470,
        "width": 1820,
        "height": 1450,
        "weight": 2949
      }
    ],
    "Ioniq 5": [
      {
        "years": "2022-2026",
        "length": 4635,
        "width": 1890,
        "height": 1605,
        "weight": 3000
      }
    ],
    "Ioniq 6": [
      {
        "years": "2023-2026",
        "length": 4855,
        "width": 1880,
        "height": 1495,
        "weight": 3000
      }
    ],
    "Terracan": [
      {
        "years": "2001-2007",
        "length": 4710,
        "width": 1860,
        "height": 1795,
        "weight": 3000
      }
    ],
    "Santa Fe": [
      {
        "years": "2001-2006",
        "length": 4500,
        "width": 1820,
        "height": 1675,
        "weight": 3000
      },
      {
        "years": "2007-2012",
        "length": 4675,
        "width": 1890,
        "height": 1725,
        "weight": 3000
      },
      {
        "years": "2013-2018",
        "length": 4690,
        "width": 1880,
        "height": 1680,
        "weight": 3000
      },
      {
        "years": "2019-2023",
        "length": 4770,
        "width": 1890,
        "height": 1680,
        "weight": 3000
      },
      {
        "years": "2024-2026",
        "length": 4830,
        "width": 1900,
        "height": 1720,
        "weight": 3000
      }
    ],
    "Palisade": [
      {
        "years": "2020-2026",
        "length": 4980,
        "width": 1975,
        "height": 1750,
        "weight": 3000
      }
    ],
    "Grand Starex / H1": [
      {
        "years": "1997-2007",
        "length": 4695,
        "width": 1820,
        "height": 1880,
        "weight": 3000
      },
      {
        "years": "2008-2021",
        "length": 5125,
        "width": 1920,
        "height": 1925,
        "weight": 3000
      }
    ],
    "Staria": [
      {
        "years": "2022-2026",
        "length": 5253,
        "width": 1997,
        "height": 1990,
        "weight": 3000
      }
    ],
    "County": [
      {
        "years": "2000-2026",
        "length": 6460,
        "width": 2080,
        "height": 2600,
        "weight": 3000
      }
    ],
    "Equus": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Genesis Coupe": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Sonata": [
      {
        "years": "2000-2026",
        "length": 4800,
        "width": 1820,
        "height": 1420,
        "weight": 3000
      }
    ],
    "Elantra": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Entourage": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Azera": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Veracruz": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Accent": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Genesis": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Tiburon": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Elantra Touring": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Scoupe": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Ioniq": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Santa Fe Xl": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Nexo": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Santa Cruz": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Elantra N": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Xcient": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Kona N": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Ioniq 5 N": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Ioniq 9": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Ioniq 6 N": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ]
  },
  "Kia": {
    "Pride": [
      {
        "years": "1987-2000",
        "length": 3565,
        "width": 1605,
        "height": 1460,
        "weight": 1838
      }
    ],
    "Picanto": [
      {
        "years": "2004-2011",
        "length": 3495,
        "width": 1595,
        "height": 1480,
        "weight": 1815
      },
      {
        "years": "2012-2017",
        "length": 3595,
        "width": 1595,
        "height": 1490,
        "weight": 1880
      },
      {
        "years": "2018-2026",
        "length": 3595,
        "width": 1595,
        "height": 1485,
        "weight": 1873
      }
    ],
    "Ray": [
      {
        "years": "2011-2026",
        "length": 3595,
        "width": 1595,
        "height": 1700,
        "weight": 2145
      }
    ],
    "Sonet": [
      {
        "years": "2021-2026",
        "length": 4110,
        "width": 1790,
        "height": 1610,
        "weight": 2961
      }
    ],
    "Rio Hatchback": [
      {
        "years": "2000-2005",
        "length": 4215,
        "width": 1675,
        "height": 1440,
        "weight": 2542
      },
      {
        "years": "2006-2011",
        "length": 3990,
        "width": 1695,
        "height": 1470,
        "weight": 2187
      },
      {
        "years": "2012-2016",
        "length": 4045,
        "width": 1720,
        "height": 1455,
        "weight": 2531
      },
      {
        "years": "2017-2023",
        "length": 4065,
        "width": 1725,
        "height": 1450,
        "weight": 2542
      }
    ],
    "Rio Sedan": [
      {
        "years": "2000-2005",
        "length": 4240,
        "width": 1675,
        "height": 1440,
        "weight": 2557
      },
      {
        "years": "2006-2011",
        "length": 4240,
        "width": 1695,
        "height": 1470,
        "weight": 2641
      },
      {
        "years": "2012-2016",
        "length": 4365,
        "width": 1720,
        "height": 1455,
        "weight": 2731
      },
      {
        "years": "2017-2023",
        "length": 4385,
        "width": 1725,
        "height": 1460,
        "weight": 2761
      }
    ],
    "Stonic": [
      {
        "years": "2017-2026",
        "length": 4140,
        "width": 1760,
        "height": 1520,
        "weight": 2769
      }
    ],
    "Soul": [
      {
        "years": "2009-2013",
        "length": 4105,
        "width": 1785,
        "height": 1610,
        "weight": 2949
      },
      {
        "years": "2014-2019",
        "length": 4140,
        "width": 1800,
        "height": 1600,
        "weight": 2981
      },
      {
        "years": "2020-2026",
        "length": 4195,
        "width": 1800,
        "height": 1600,
        "weight": 3000
      }
    ],
    "Soluto": [
      {
        "years": "2019-2026",
        "length": 4300,
        "width": 1700,
        "height": 1460,
        "weight": 2668
      }
    ],
    "Sephia": [
      {
        "years": "1992-2003",
        "length": 4360,
        "width": 1695,
        "height": 1390,
        "weight": 2568
      }
    ],
    "Seltos": [
      {
        "years": "2020-2023",
        "length": 4315,
        "width": 1800,
        "height": 1620,
        "weight": 3000
      },
      {
        "years": "2024-2026",
        "length": 4365,
        "width": 1800,
        "height": 1630,
        "weight": 3000
      }
    ],
    "Niro": [
      {
        "years": "2017-2022",
        "length": 4355,
        "width": 1805,
        "height": 1545,
        "weight": 3000
      },
      {
        "years": "2023-2026",
        "length": 4420,
        "width": 1825,
        "height": 1545,
        "weight": 3000
      }
    ],
    "Carens": [
      {
        "years": "2006-2012",
        "length": 4545,
        "width": 1820,
        "height": 1650,
        "weight": 3000
      },
      {
        "years": "2013-2019",
        "length": 4525,
        "width": 1805,
        "height": 1610,
        "weight": 3000
      },
      {
        "years": "2022-2026",
        "length": 4540,
        "width": 1800,
        "height": 1700,
        "weight": 3000
      }
    ],
    "Rondo": [
      {
        "years": "2006-2012",
        "length": 4545,
        "width": 1820,
        "height": 1650,
        "weight": 3000
      },
      {
        "years": "2013-2019",
        "length": 4525,
        "width": 1805,
        "height": 1610,
        "weight": 3000
      }
    ],
    "Cerato Hatchback": [
      {
        "years": "2004-2024",
        "length": 4510,
        "width": 1800,
        "height": 1445,
        "weight": 3000
      }
    ],
    "Cerato Sedan": [
      {
        "years": "2004-2024",
        "length": 4640,
        "width": 1800,
        "height": 1440,
        "weight": 3000
      }
    ],
    "Cerato Pro": [
      {
        "years": "2013-2018",
        "length": 4560,
        "width": 1780,
        "height": 1445,
        "weight": 3000
      },
      {
        "years": "2019-2024",
        "length": 4640,
        "width": 1800,
        "height": 1440,
        "weight": 3000
      }
    ],
    "Forte": [
      {
        "years": "2009-2024",
        "length": 4640,
        "width": 1800,
        "height": 1435,
        "weight": 3000
      }
    ],
    "K3 Sedan": [
      {
        "years": "2024-2026",
        "length": 4545,
        "width": 1765,
        "height": 1475,
        "weight": 3000
      }
    ],
    "K3 Hatchback": [
      {
        "years": "2024-2026",
        "length": 4295,
        "width": 1765,
        "height": 1495,
        "weight": 2833
      }
    ],
    "Sportage": [
      {
        "years": "1993-2026",
        "length": 4660,
        "width": 1865,
        "height": 1660,
        "weight": 3000
      }
    ],
    "EV6": [
      {
        "years": "2022-2026",
        "length": 4680,
        "width": 1880,
        "height": 1550,
        "weight": 3000
      }
    ],
    "Sorento": [
      {
        "years": "2002-2026",
        "length": 4810,
        "width": 1900,
        "height": 1700,
        "weight": 3000
      }
    ],
    "Stinger": [
      {
        "years": "2018-2023",
        "length": 4830,
        "width": 1870,
        "height": 1400,
        "weight": 3000
      }
    ],
    "Optima": [
      {
        "years": "2001-2020",
        "length": 4855,
        "width": 1860,
        "height": 1465,
        "weight": 3000
      }
    ],
    "K5": [
      {
        "years": "2021-2026",
        "length": 4905,
        "width": 1860,
        "height": 1445,
        "weight": 3000
      }
    ],
    "Telluride": [
      {
        "years": "2020-2026",
        "length": 5000,
        "width": 1990,
        "height": 1750,
        "weight": 3000
      }
    ],
    "EV9": [
      {
        "years": "2024-2026",
        "length": 5010,
        "width": 1980,
        "height": 1755,
        "weight": 3000
      }
    ],
    "Mohave": [
      {
        "years": "2008-2024",
        "length": 4880,
        "width": 1915,
        "height": 1810,
        "weight": 3000
      }
    ],
    "Carnival": [
      {
        "years": "2006-2026",
        "length": 5155,
        "width": 1995,
        "height": 1740,
        "weight": 3000
      }
    ],
    "Grand Carnival": [
      {
        "years": "2006-2020",
        "length": 5115,
        "width": 1985,
        "height": 1755,
        "weight": 3000
      }
    ],
    "K2700": [
      {
        "years": "2005-2026",
        "length": 4820,
        "width": 1740,
        "height": 1995,
        "weight": 3000
      }
    ],
    "Bongo": [
      {
        "years": "2005-2026",
        "length": 4820,
        "width": 1740,
        "height": 1995,
        "weight": 3000
      }
    ],
    "Rio": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Borrego": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Sedona": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Cadenza": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Spectra": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Amanti": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Tekiar": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ]
  },
  "SsangYong": {
    "Tivoli": [
      {
        "years": "2015-2023",
        "length": 4202,
        "width": 1798,
        "height": 1590,
        "weight": 3000
      },
      {
        "years": "2024-2026",
        "length": 4225,
        "width": 1810,
        "height": 1613,
        "weight": 3000
      }
    ],
    "Korando": [
      {
        "years": "2010-2018",
        "length": 4410,
        "width": 1830,
        "height": 1675,
        "weight": 3000
      },
      {
        "years": "2019-2026",
        "length": 4450,
        "width": 1870,
        "height": 1620,
        "weight": 3000
      }
    ],
    "Torres": [
      {
        "years": "2023-2026",
        "length": 4700,
        "width": 1890,
        "height": 1720,
        "weight": 3000
      }
    ],
    "Kyron": [
      {
        "years": "2005-2014",
        "length": 4660,
        "width": 1880,
        "height": 1740,
        "weight": 3000
      }
    ],
    "Actyon Sports": [
      {
        "years": "2006-2011",
        "length": 4965,
        "width": 1900,
        "height": 1755,
        "weight": 3000
      },
      {
        "years": "2012-2018",
        "length": 4990,
        "width": 1910,
        "height": 1790,
        "weight": 3000
      }
    ],
    "Rexton": [
      {
        "years": "2001-2016",
        "length": 4720,
        "width": 1870,
        "height": 1830,
        "weight": 3000
      },
      {
        "years": "2017-2026",
        "length": 4850,
        "width": 1960,
        "height": 1825,
        "weight": 3000
      }
    ],
    "Musso": [
      {
        "years": "2018-2026",
        "length": 5095,
        "width": 1950,
        "height": 1840,
        "weight": 3000
      }
    ],
    "Musso Grand": [
      {
        "years": "2019-2026",
        "length": 5405,
        "width": 1950,
        "height": 1885,
        "weight": 3000
      }
    ]
  },
  "Daewoo": {
    "Matiz": [
      {
        "years": "1998-2005",
        "length": 3495,
        "width": 1495,
        "height": 1485,
        "weight": 1707
      }
    ],
    "Lanos": [
      {
        "years": "1997-2002",
        "length": 4074,
        "width": 1678,
        "height": 1432,
        "weight": 2447
      }
    ],
    "Nubira": [
      {
        "years": "1997-2002",
        "length": 4248,
        "width": 1699,
        "height": 1425,
        "weight": 2571
      }
    ],
    "Cielo": [
      {
        "years": "1994-1997",
        "length": 4256,
        "width": 1662,
        "height": 1393,
        "weight": 2463
      }
    ],
    "Tacuma": [
      {
        "years": "2000-2008",
        "length": 4350,
        "width": 1755,
        "height": 1580,
        "weight": 3000
      }
    ],
    "Leganza": [
      {
        "years": "1997-2002",
        "length": 4671,
        "width": 1779,
        "height": 1437,
        "weight": 3000
      }
    ],
    "Laganza V-car": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Leganza V-200 & Variants/derivatives": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ]
  },
  "Genesis": {
    "GV60": [
      {
        "years": "2022-2026",
        "length": 4515,
        "width": 1890,
        "height": 1580,
        "weight": 3000
      }
    ],
    "G70": [
      {
        "years": "2017-2026",
        "length": 4685,
        "width": 1850,
        "height": 1400,
        "weight": 3000
      }
    ],
    "GV70": [
      {
        "years": "2021-2026",
        "length": 4715,
        "width": 1910,
        "height": 1630,
        "weight": 3000
      }
    ],
    "G80": [
      {
        "years": "2016-2020",
        "length": 4990,
        "width": 1890,
        "height": 1480,
        "weight": 3000
      },
      {
        "years": "2021-2026",
        "length": 4995,
        "width": 1925,
        "height": 1465,
        "weight": 3000
      }
    ],
    "GV80": [
      {
        "years": "2020-2026",
        "length": 4945,
        "width": 1975,
        "height": 1715,
        "weight": 3000
      }
    ],
    "G90": [
      {
        "years": "2016-2021",
        "length": 5205,
        "width": 1915,
        "height": 1495,
        "weight": 3000
      },
      {
        "years": "2022-2026",
        "length": 5275,
        "width": 1930,
        "height": 1490,
        "weight": 3000
      }
    ],
    "Genesis Supreme": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Envy": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Supreme": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Genesis": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Tahoe": [
      {
        "years": "2000-2026",
        "length": 5200,
        "width": 1950,
        "height": 1850,
        "weight": 3000
      }
    ]
  },
  "Volkswagen": {
    "Up!": [
      {
        "years": "2014-2021",
        "length": 3605,
        "width": 1645,
        "height": 1500,
        "weight": 1957
      }
    ],
    "Fox": [
      {
        "years": "2004-2021",
        "length": 3823,
        "width": 1640,
        "height": 1544,
        "weight": 2130
      }
    ],
    "CrossFox": [
      {
        "years": "2005-2021",
        "length": 4034,
        "width": 1677,
        "height": 1600,
        "weight": 2706
      }
    ],
    "Gol Hatchback": [
      {
        "years": "1994-1999",
        "length": 3890,
        "width": 1640,
        "height": 1415,
        "weight": 1986
      },
      {
        "years": "2000-2008",
        "length": 3915,
        "width": 1645,
        "height": 1415,
        "weight": 2005
      },
      {
        "years": "2009-2023",
        "length": 3892,
        "width": 1656,
        "height": 1464,
        "weight": 2076
      }
    ],
    "Polo Hatchback": [
      {
        "years": "2002-2009",
        "length": 3915,
        "width": 1650,
        "height": 1465,
        "weight": 2082
      },
      {
        "years": "2010-2017",
        "length": 3970,
        "width": 1682,
        "height": 1462,
        "weight": 2148
      },
      {
        "years": "2018-2026",
        "length": 4074,
        "width": 1751,
        "height": 1451,
        "weight": 2588
      }
    ],
    "Polo Sedan": [
      {
        "years": "2003-2022",
        "length": 4390,
        "width": 1699,
        "height": 1467,
        "weight": 2735
      }
    ],
    "New Beetle": [
      {
        "years": "1998-2011",
        "length": 4129,
        "width": 1721,
        "height": 1498,
        "weight": 2661
      }
    ],
    "Beetle": [
      {
        "years": "2012-2019",
        "length": 4278,
        "width": 1808,
        "height": 1486,
        "weight": 2873
      }
    ],
    "Golf": [
      {
        "years": "1999-2006",
        "length": 4149,
        "width": 1735,
        "height": 1444,
        "weight": 2599
      },
      {
        "years": "2007-2012",
        "length": 4199,
        "width": 1779,
        "height": 1479,
        "weight": 2762
      },
      {
        "years": "2013-2019",
        "length": 4255,
        "width": 1799,
        "height": 1452,
        "weight": 2779
      },
      {
        "years": "2020-2026",
        "length": 4284,
        "width": 1789,
        "height": 1456,
        "weight": 2790
      }
    ],
    "T-Cross": [
      {
        "years": "2019-2026",
        "length": 4199,
        "width": 1760,
        "height": 1570,
        "weight": 2901
      }
    ],
    "Voyage": [
      {
        "years": "2009-2023",
        "length": 4218,
        "width": 1656,
        "height": 1464,
        "weight": 2557
      }
    ],
    "Nivus": [
      {
        "years": "2021-2026",
        "length": 4266,
        "width": 1757,
        "height": 1493,
        "weight": 2798
      }
    ],
    "T-Roc": [
      {
        "years": "2018-2026",
        "length": 4234,
        "width": 1819,
        "height": 1573,
        "weight": 3000
      }
    ],
    "Eos": [
      {
        "years": "2006-2015",
        "length": 4423,
        "width": 1791,
        "height": 1444,
        "weight": 2860
      }
    ],
    "Bora": [
      {
        "years": "1999-2015",
        "length": 4376,
        "width": 1735,
        "height": 1446,
        "weight": 2745
      }
    ],
    "Vento": [
      {
        "years": "2014-2022",
        "length": 4390,
        "width": 1699,
        "height": 1467,
        "weight": 2735
      }
    ],
    "Tiguan": [
      {
        "years": "2008-2016",
        "length": 4427,
        "width": 1809,
        "height": 1686,
        "weight": 3000
      }
    ],
    "Tiguan Allspace": [
      {
        "years": "2017-2026",
        "length": 4703,
        "width": 1839,
        "height": 1672,
        "weight": 3000
      }
    ],
    "Saveiro Cabina Sencilla": [
      {
        "years": "2010-2026",
        "length": 4474,
        "width": 1713,
        "height": 1520,
        "weight": 2912
      }
    ],
    "Saveiro Cabina Doble": [
      {
        "years": "2015-2026",
        "length": 4493,
        "width": 1713,
        "height": 1539,
        "weight": 2961
      }
    ],
    "Taos": [
      {
        "years": "2021-2026",
        "length": 4461,
        "width": 1841,
        "height": 1626,
        "weight": 3000
      }
    ],
    "Tarek": [
      {
        "years": "2021-2026",
        "length": 4468,
        "width": 1841,
        "height": 1624,
        "weight": 3000
      }
    ],
    "Virtus": [
      {
        "years": "2018-2022",
        "length": 4482,
        "width": 1751,
        "height": 1472,
        "weight": 2888
      },
      {
        "years": "2023-2026",
        "length": 4561,
        "width": 1752,
        "height": 1487,
        "weight": 3000
      }
    ],
    "Jetta ": [
      {
        "years": "2008-2015",
        "length": 4402,
        "width": 1735,
        "height": 1446,
        "weight": 2761
      }
    ],
    "Jetta": [
      {
        "years": "1999-2005",
        "length": 4376,
        "width": 1735,
        "height": 1446,
        "weight": 2745
      },
      {
        "years": "2006-2010",
        "length": 4554,
        "width": 1779,
        "height": 1459,
        "weight": 3000
      },
      {
        "years": "2011-2018",
        "length": 4644,
        "width": 1778,
        "height": 1454,
        "weight": 3000
      },
      {
        "years": "2019-2026",
        "length": 4702,
        "width": 1799,
        "height": 1452,
        "weight": 3000
      }
    ],
    "ID.4": [
      {
        "years": "2021-2026",
        "length": 4584,
        "width": 1852,
        "height": 1612,
        "weight": 3000
      }
    ],
    "Touareg": [
      {
        "years": "2003-2010",
        "length": 4754,
        "width": 1928,
        "height": 1726,
        "weight": 3000
      },
      {
        "years": "2011-2018",
        "length": 4795,
        "width": 1940,
        "height": 1709,
        "weight": 3000
      },
      {
        "years": "2019-2026",
        "length": 4878,
        "width": 1984,
        "height": 1717,
        "weight": 3000
      }
    ],
    "Passat": [
      {
        "years": "2006-2010",
        "length": 4765,
        "width": 1820,
        "height": 1472,
        "weight": 3000
      },
      {
        "years": "2011-2015",
        "length": 4769,
        "width": 1820,
        "height": 1470,
        "weight": 3000
      },
      {
        "years": "2016-2023",
        "length": 4775,
        "width": 1832,
        "height": 1483,
        "weight": 3000
      }
    ],
    "Transporter": [
      {
        "years": "2004-2015",
        "length": 4892,
        "width": 1904,
        "height": 1970,
        "weight": 3000
      },
      {
        "years": "2016-2026",
        "length": 4904,
        "width": 1904,
        "height": 1990,
        "weight": 3000
      }
    ],
    "Kombi": [
      {
        "years": "1975-2013",
        "length": 4505,
        "width": 1720,
        "height": 2040,
        "weight": 3000
      }
    ],
    "Teramont": [
      {
        "years": "2018-2023",
        "length": 5037,
        "width": 1989,
        "height": 1775,
        "weight": 3000
      },
      {
        "years": "2024-2026",
        "length": 5097,
        "width": 1989,
        "height": 1788,
        "weight": 3000
      }
    ],
    "Atlas": [
      {
        "years": "2018-2023",
        "length": 5037,
        "width": 1989,
        "height": 1775,
        "weight": 3000
      },
      {
        "years": "2024-2026",
        "length": 5097,
        "width": 1989,
        "height": 1788,
        "weight": 3000
      }
    ],
    "Amarok": [
      {
        "years": "2011-2022",
        "length": 5254,
        "width": 1954,
        "height": 1834,
        "weight": 3000
      },
      {
        "years": "2023-2026",
        "length": 5350,
        "width": 1997,
        "height": 1882,
        "weight": 3000
      }
    ],
    "Crafter": [
      {
        "years": "2006-2016",
        "length": 5245,
        "width": 1993,
        "height": 2415,
        "weight": 3000
      },
      {
        "years": "2017-2026",
        "length": 5986,
        "width": 2040,
        "height": 2355,
        "weight": 3000
      }
    ],
    "Routan": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Phaeton": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Jetta Wagon": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Rabbit": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Golf Iii": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Corrado": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Eurovan": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "E-golf": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Cabrio": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Golf R": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Cabriolet": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Quantum": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Scirocco": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Vanagon": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Dasher": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Golf Alltrack": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Tiguan Limited": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Jetta Gli": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Id. Buzz": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ]
  },
  "Mercedes-Benz": {
    "Clase A Hatchback": [
      {
        "years": "1997-2004",
        "length": 3575,
        "width": 1719,
        "height": 1575,
        "weight": 2129
      },
      {
        "years": "2005-2012",
        "length": 3838,
        "width": 1764,
        "height": 1593,
        "weight": 2373
      },
      {
        "years": "2013-2018",
        "length": 4292,
        "width": 1780,
        "height": 1433,
        "weight": 2737
      },
      {
        "years": "2019-2026",
        "length": 4419,
        "width": 1796,
        "height": 1440,
        "weight": 2857
      }
    ],
    "Clase A Sedan": [
      {
        "years": "2019-2026",
        "length": 4549,
        "width": 1796,
        "height": 1446,
        "weight": 3000
      }
    ],
    "Clase B": [
      {
        "years": "2005-2011",
        "length": 4270,
        "width": 1777,
        "height": 1603,
        "weight": 3000
      },
      {
        "years": "2012-2018",
        "length": 4359,
        "width": 1786,
        "height": 1557,
        "weight": 3000
      },
      {
        "years": "2019-2026",
        "length": 4419,
        "width": 1796,
        "height": 1562,
        "weight": 3000
      }
    ],
    "CLA": [
      {
        "years": "2013-2019",
        "length": 4630,
        "width": 1777,
        "height": 1432,
        "weight": 3000
      },
      {
        "years": "2020-2026",
        "length": 4688,
        "width": 1830,
        "height": 1439,
        "weight": 3000
      }
    ],
    "Clase C Sedan": [
      {
        "years": "2000-2007",
        "length": 4525,
        "width": 1728,
        "height": 1425,
        "weight": 3000
      },
      {
        "years": "2008-2014",
        "length": 4591,
        "width": 1770,
        "height": 1442,
        "weight": 3000
      },
      {
        "years": "2015-2021",
        "length": 4686,
        "width": 1810,
        "height": 1442,
        "weight": 3000
      },
      {
        "years": "2022-2026",
        "length": 4751,
        "width": 1820,
        "height": 1438,
        "weight": 3000
      }
    ],
    "Clase C Coupe": [
      {
        "years": "2011-2015",
        "length": 4590,
        "width": 1770,
        "height": 1406,
        "weight": 3000
      },
      {
        "years": "2016-2023",
        "length": 4686,
        "width": 1810,
        "height": 1405,
        "weight": 3000
      }
    ],
    "GLA": [
      {
        "years": "2014-2020",
        "length": 4417,
        "width": 1804,
        "height": 1494,
        "weight": 2976
      },
      {
        "years": "2021-2026",
        "length": 4410,
        "width": 1834,
        "height": 1611,
        "weight": 3000
      }
    ],
    "GLB": [
      {
        "years": "2020-2026",
        "length": 4634,
        "width": 1834,
        "height": 1658,
        "weight": 3000
      }
    ],
    "GLC SUV": [
      {
        "years": "2016-2022",
        "length": 4656,
        "width": 1890,
        "height": 1639,
        "weight": 3000
      },
      {
        "years": "2023-2026",
        "length": 4716,
        "width": 1890,
        "height": 1640,
        "weight": 3000
      }
    ],
    "GLC Coupe": [
      {
        "years": "2017-2023",
        "length": 4732,
        "width": 1890,
        "height": 1602,
        "weight": 3000
      },
      {
        "years": "2024-2026",
        "length": 4763,
        "width": 1890,
        "height": 1605,
        "weight": 3000
      }
    ],
    "GLK": [
      {
        "years": "2008-2015",
        "length": 4528,
        "width": 1840,
        "height": 1689,
        "weight": 3000
      }
    ],
    "Clase E Sedan": [
      {
        "years": "2003-2009",
        "length": 4818,
        "width": 1822,
        "height": 1450,
        "weight": 3000
      },
      {
        "years": "2010-2016",
        "length": 4879,
        "width": 1854,
        "height": 1469,
        "weight": 3000
      },
      {
        "years": "2017-2023",
        "length": 4923,
        "width": 1852,
        "height": 1468,
        "weight": 3000
      },
      {
        "years": "2024-2026",
        "length": 4949,
        "width": 1880,
        "height": 1468,
        "weight": 3000
      }
    ],
    "GLE SUV": [
      {
        "years": "2016-2019",
        "length": 4819,
        "width": 1935,
        "height": 1796,
        "weight": 3000
      },
      {
        "years": "2020-2026",
        "length": 4924,
        "width": 1947,
        "height": 1797,
        "weight": 3000
      }
    ],
    "GLE Coupe": [
      {
        "years": "2016-2019",
        "length": 4900,
        "width": 2003,
        "height": 1731,
        "weight": 3000
      },
      {
        "years": "2020-2026",
        "length": 4939,
        "width": 2010,
        "height": 1730,
        "weight": 3000
      }
    ],
    "Clase M": [
      {
        "years": "1998-2005",
        "length": 4587,
        "width": 1833,
        "height": 1776,
        "weight": 3000
      },
      {
        "years": "2006-2011",
        "length": 4780,
        "width": 1911,
        "height": 1815,
        "weight": 3000
      },
      {
        "years": "2012-2015",
        "length": 4804,
        "width": 1926,
        "height": 1796,
        "weight": 3000
      }
    ],
    "ML": [
      {
        "years": "1998-2015",
        "length": 4804,
        "width": 1926,
        "height": 1796,
        "weight": 3000
      }
    ],
    "GLS": [
      {
        "years": "2016-2019",
        "length": 5130,
        "width": 1934,
        "height": 1850,
        "weight": 3000
      },
      {
        "years": "2020-2026",
        "length": 5207,
        "width": 1956,
        "height": 1823,
        "weight": 3000
      }
    ],
    "GLS Maybach": [
      {
        "years": "2021-2026",
        "length": 5205,
        "width": 2030,
        "height": 1838,
        "weight": 3000
      }
    ],
    "GL": [
      {
        "years": "2007-2012",
        "length": 5085,
        "width": 1920,
        "height": 1840,
        "weight": 3000
      },
      {
        "years": "2013-2015",
        "length": 5120,
        "width": 1934,
        "height": 1850,
        "weight": 3000
      }
    ],
    "Clase G": [
      {
        "years": "1990-2018",
        "length": 4662,
        "width": 1760,
        "height": 1951,
        "weight": 3000
      },
      {
        "years": "2019-2026",
        "length": 4817,
        "width": 1931,
        "height": 1969,
        "weight": 3000
      }
    ],
    "Clase S": [
      {
        "years": "2014-2020",
        "length": 5116,
        "width": 1899,
        "height": 1496,
        "weight": 3000
      },
      {
        "years": "2021-2026",
        "length": 5179,
        "width": 1921,
        "height": 1503,
        "weight": 3000
      }
    ],
    "CLS": [
      {
        "years": "2004-2010",
        "length": 4913,
        "width": 1873,
        "height": 1403,
        "weight": 3000
      },
      {
        "years": "2011-2018",
        "length": 4940,
        "width": 1881,
        "height": 1416,
        "weight": 3000
      },
      {
        "years": "2019-2023",
        "length": 4988,
        "width": 1890,
        "height": 1435,
        "weight": 3000
      }
    ],
    "EQA": [
      {
        "years": "2021-2026",
        "length": 4463,
        "width": 1834,
        "height": 1620,
        "weight": 3000
      }
    ],
    "EQB": [
      {
        "years": "2021-2026",
        "length": 4684,
        "width": 1834,
        "height": 1667,
        "weight": 3000
      }
    ],
    "EQE SUV": [
      {
        "years": "2023-2026",
        "length": 4863,
        "width": 1940,
        "height": 1686,
        "weight": 3000
      }
    ],
    "EQE Sedan": [
      {
        "years": "2022-2026",
        "length": 4946,
        "width": 1906,
        "height": 1512,
        "weight": 3000
      }
    ],
    "EQS SUV": [
      {
        "years": "2023-2026",
        "length": 5125,
        "width": 1959,
        "height": 1718,
        "weight": 3000
      }
    ],
    "EQS Sedan": [
      {
        "years": "2022-2026",
        "length": 5216,
        "width": 1926,
        "height": 1512,
        "weight": 3000
      }
    ],
    "Clase X": [
      {
        "years": "2017-2020",
        "length": 5340,
        "width": 1920,
        "height": 1819,
        "weight": 3000
      }
    ],
    "SLK": [
      {
        "years": "1996-2004",
        "length": 3995,
        "width": 1715,
        "height": 1278,
        "weight": 1926
      },
      {
        "years": "2005-2010",
        "length": 4082,
        "width": 1777,
        "height": 1296,
        "weight": 2350
      },
      {
        "years": "2011-2016",
        "length": 4134,
        "width": 1810,
        "height": 1301,
        "weight": 2434
      }
    ],
    "SLC": [
      {
        "years": "2016-2020",
        "length": 4133,
        "width": 1810,
        "height": 1301,
        "weight": 2433
      }
    ],
    "SL Roadster": [
      {
        "years": "2002-2011",
        "length": 4535,
        "width": 1815,
        "height": 1298,
        "weight": 2991
      },
      {
        "years": "2012-2020",
        "length": 4612,
        "width": 1877,
        "height": 1315,
        "weight": 3000
      },
      {
        "years": "2022-2026",
        "length": 4705,
        "width": 1915,
        "height": 1354,
        "weight": 3000
      }
    ],
    "AMG GT": [
      {
        "years": "2015-2023",
        "length": 4544,
        "width": 1939,
        "height": 1287,
        "weight": 3000
      },
      {
        "years": "2024-2026",
        "length": 4728,
        "width": 1984,
        "height": 1354,
        "weight": 3000
      }
    ],
    "AMG GT 4 puertas": [
      {
        "years": "2019-2026",
        "length": 5054,
        "width": 1953,
        "height": 1442,
        "weight": 3000
      }
    ],
    "Vito": [
      {
        "years": "2003-2014",
        "length": 4748,
        "width": 1901,
        "height": 1902,
        "weight": 3000
      },
      {
        "years": "2015-2026",
        "length": 4895,
        "width": 1928,
        "height": 1910,
        "weight": 3000
      }
    ],
    "V-Class": [
      {
        "years": "2014-2026",
        "length": 5140,
        "width": 1928,
        "height": 1880,
        "weight": 3000
      }
    ],
    "Sprinter Corta": [
      {
        "years": "2007-2026",
        "length": 5267,
        "width": 1993,
        "height": 2435,
        "weight": 3000
      }
    ],
    "Sprinter Larga": [
      {
        "years": "2007-2026",
        "length": 5910,
        "width": 2020,
        "height": 2720,
        "weight": 3000
      }
    ],
    "Sprinter Extra Larga": [
      {
        "years": "2007-2026",
        "length": 7361,
        "width": 2020,
        "height": 2820,
        "weight": 3000
      }
    ],
    "Citan": [
      {
        "years": "2012-2026",
        "length": 4488,
        "width": 1859,
        "height": 1832,
        "weight": 3000
      }
    ],
    "Clase T": [
      {
        "years": "2022-2026",
        "length": 4498,
        "width": 1859,
        "height": 1811,
        "weight": 3000
      }
    ],
    "Sprinter": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "Sl-class": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "Slk-class": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "E-class": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "Cls-class": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "Cla-class": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "Gla-class": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "C-class": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "S-class": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "Sls-class": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "B-class": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "M-class": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "Gl-class": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "G-class": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "Glk-class": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "Cl-class": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "Clk-class": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "Slr Mclaren": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "R-class": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "Glc-class": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "Gle-class": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "Metris": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "Slc-class": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "Ml-class": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "Gls-class": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "A-class": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "Glb-class": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "Eqc-class": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "Eqs-class Sedan": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "Eqe-class Sedan": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "Eqb-class": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "Eqs-class Suv": [
      {
        "years": "2000-2026",
        "length": 5200,
        "width": 1950,
        "height": 1850,
        "weight": 3000
      }
    ],
    "Eqe-class Suv": [
      {
        "years": "2000-2026",
        "length": 5200,
        "width": 1950,
        "height": 1850,
        "weight": 3000
      }
    ],
    "Esprinter": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ]
  },
  "BMW": {
    "Serie 1": [
      {
        "years": "2004-2011",
        "length": 4239,
        "width": 1748,
        "height": 1421,
        "weight": 2632
      },
      {
        "years": "2012-2019",
        "length": 4324,
        "width": 1765,
        "height": 1421,
        "weight": 2711
      },
      {
        "years": "2020-2026",
        "length": 4319,
        "width": 1799,
        "height": 1434,
        "weight": 2786
      }
    ],
    "Serie 2 Coupe": [
      {
        "years": "2014-2021",
        "length": 4432,
        "width": 1774,
        "height": 1418,
        "weight": 2787
      },
      {
        "years": "2022-2026",
        "length": 4537,
        "width": 1838,
        "height": 1390,
        "weight": 3000
      }
    ],
    "Serie 2 Gran Coupe": [
      {
        "years": "2020-2026",
        "length": 4526,
        "width": 1800,
        "height": 1420,
        "weight": 3000
      }
    ],
    "Serie 3 Sedan": [
      {
        "years": "1998-2005",
        "length": 4471,
        "width": 1739,
        "height": 1415,
        "weight": 2750
      },
      {
        "years": "2006-2011",
        "length": 4531,
        "width": 1817,
        "height": 1421,
        "weight": 3000
      },
      {
        "years": "2012-2018",
        "length": 4624,
        "width": 1811,
        "height": 1429,
        "weight": 3000
      },
      {
        "years": "2019-2026",
        "length": 4709,
        "width": 1827,
        "height": 1435,
        "weight": 3000
      }
    ],
    "Serie 4 Coupe": [
      {
        "years": "2014-2020",
        "length": 4638,
        "width": 1825,
        "height": 1377,
        "weight": 3000
      },
      {
        "years": "2021-2026",
        "length": 4768,
        "width": 1852,
        "height": 1383,
        "weight": 3000
      }
    ],
    "Serie 4 Gran Coupe": [
      {
        "years": "2014-2020",
        "length": 4638,
        "width": 1825,
        "height": 1389,
        "weight": 3000
      },
      {
        "years": "2021-2026",
        "length": 4783,
        "width": 1852,
        "height": 1442,
        "weight": 3000
      }
    ],
    "Serie 5 Sedan": [
      {
        "years": "2003-2010",
        "length": 4841,
        "width": 1846,
        "height": 1468,
        "weight": 3000
      },
      {
        "years": "2011-2016",
        "length": 4899,
        "width": 1860,
        "height": 1464,
        "weight": 3000
      },
      {
        "years": "2017-2023",
        "length": 4936,
        "width": 1868,
        "height": 1479,
        "weight": 3000
      },
      {
        "years": "2024-2026",
        "length": 5060,
        "width": 1900,
        "height": 1515,
        "weight": 3000
      }
    ],
    "Serie 7": [
      {
        "years": "2002-2008",
        "length": 5039,
        "width": 1902,
        "height": 1491,
        "weight": 3000
      },
      {
        "years": "2009-2015",
        "length": 5072,
        "width": 1902,
        "height": 1479,
        "weight": 3000
      },
      {
        "years": "2016-2022",
        "length": 5098,
        "width": 1902,
        "height": 1467,
        "weight": 3000
      },
      {
        "years": "2023-2026",
        "length": 5391,
        "width": 1950,
        "height": 1544,
        "weight": 3000
      }
    ],
    "Serie 8 Coupe": [
      {
        "years": "2019-2026",
        "length": 4843,
        "width": 1902,
        "height": 1341,
        "weight": 3000
      }
    ],
    "Serie 8 Gran Coupe": [
      {
        "years": "2020-2026",
        "length": 5082,
        "width": 1932,
        "height": 1407,
        "weight": 3000
      }
    ],
    "X1": [
      {
        "years": "2009-2015",
        "length": 4454,
        "width": 1798,
        "height": 1545,
        "weight": 3000
      },
      {
        "years": "2016-2022",
        "length": 4439,
        "width": 1821,
        "height": 1598,
        "weight": 3000
      },
      {
        "years": "2023-2026",
        "length": 4500,
        "width": 1845,
        "height": 1642,
        "weight": 3000
      }
    ],
    "X2": [
      {
        "years": "2018-2023",
        "length": 4360,
        "width": 1824,
        "height": 1526,
        "weight": 3000
      },
      {
        "years": "2024-2026",
        "length": 4554,
        "width": 1845,
        "height": 1590,
        "weight": 3000
      }
    ],
    "X3": [
      {
        "years": "2003-2010",
        "length": 4565,
        "width": 1853,
        "height": 1674,
        "weight": 3000
      },
      {
        "years": "2011-2017",
        "length": 4648,
        "width": 1881,
        "height": 1661,
        "weight": 3000
      },
      {
        "years": "2018-2026",
        "length": 4708,
        "width": 1891,
        "height": 1676,
        "weight": 3000
      }
    ],
    "X4": [
      {
        "years": "2014-2018",
        "length": 4671,
        "width": 1881,
        "height": 1624,
        "weight": 3000
      },
      {
        "years": "2019-2026",
        "length": 4752,
        "width": 1918,
        "height": 1621,
        "weight": 3000
      }
    ],
    "X5": [
      {
        "years": "2000-2006",
        "length": 4667,
        "width": 1872,
        "height": 1715,
        "weight": 3000
      },
      {
        "years": "2007-2013",
        "length": 4854,
        "width": 1933,
        "height": 1776,
        "weight": 3000
      },
      {
        "years": "2014-2018",
        "length": 4886,
        "width": 1938,
        "height": 1762,
        "weight": 3000
      },
      {
        "years": "2019-2026",
        "length": 4922,
        "width": 2004,
        "height": 1745,
        "weight": 3000
      }
    ],
    "X6": [
      {
        "years": "2008-2014",
        "length": 4877,
        "width": 1983,
        "height": 1690,
        "weight": 3000
      },
      {
        "years": "2015-2019",
        "length": 4909,
        "width": 1989,
        "height": 1702,
        "weight": 3000
      },
      {
        "years": "2020-2026",
        "length": 4935,
        "width": 2004,
        "height": 1696,
        "weight": 3000
      }
    ],
    "X7": [
      {
        "years": "2019-2026",
        "length": 5151,
        "width": 2000,
        "height": 1805,
        "weight": 3000
      }
    ],
    "XM": [
      {
        "years": "2023-2026",
        "length": 5110,
        "width": 2005,
        "height": 1755,
        "weight": 3000
      }
    ],
    "Z4 Roadster": [
      {
        "years": "2003-2008",
        "length": 4091,
        "width": 1781,
        "height": 1299,
        "weight": 2366
      },
      {
        "years": "2009-2016",
        "length": 4239,
        "width": 1790,
        "height": 1291,
        "weight": 2449
      },
      {
        "years": "2019-2026",
        "length": 4324,
        "width": 1864,
        "height": 1304,
        "weight": 2628
      }
    ],
    "i3": [
      {
        "years": "2013-2022",
        "length": 3999,
        "width": 1775,
        "height": 1578,
        "weight": 2464
      }
    ],
    "i4": [
      {
        "years": "2022-2026",
        "length": 4783,
        "width": 1852,
        "height": 1448,
        "weight": 3000
      }
    ],
    "iX": [
      {
        "years": "2022-2026",
        "length": 4953,
        "width": 1967,
        "height": 1695,
        "weight": 3000
      }
    ],
    "128i": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "135i": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "328i": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "335i": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "335is": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "335d": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "528i": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "535i": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "550i": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "740i": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "740li": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "750i": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "750li": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "760li": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "750xi": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "750lxi": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "528xi": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "640i": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "650i": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "650xi": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "228i": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "M235i": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "320i": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "328d": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "428i": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "435i": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "535d": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "535xi": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "328xi": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "335xi": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "525i": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "530i": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "530xi": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "525xi": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "325ci": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "330ci": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "325i": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "325xi": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "330i": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "330xi": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "760i": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "545i": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "645ci": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "745i": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "745li": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "318i": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "318is": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "318ic": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "325is": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "325ic": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "540i": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "840ci": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "850ci": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "850csi": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "318ti": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "328ic": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "328is": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "323i": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "323is": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "323ic": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "525ia": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "530ia": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "540ia": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "645i": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "740il": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "750il": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "M3ci": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "340i": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "330e": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "328ci": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "735i": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "735il": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "850i": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "325ix": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "325/325e": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "635csi": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "535i/535is": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "524td": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "528e": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "325i/325is": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "230i": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "M240i": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "430i": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "440i": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "740e": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "533i": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "633 Csi": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "733i": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "730i": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "540d": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "530e": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "M550i": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "M760i": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "750i, B7": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "650i, B6": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "640xi": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "M340i": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "745e": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "840i": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "M850i": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "M440i": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "M760li": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "745le": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "750e": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "325/325es": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "550e": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ]
  },
  "Audi": {
    "A1 Sportback": [
      {
        "years": "2010-2018",
        "length": 3954,
        "width": 1740,
        "height": 1416,
        "weight": 2143
      },
      {
        "years": "2019-2026",
        "length": 4029,
        "width": 1740,
        "height": 1409,
        "weight": 2469
      }
    ],
    "A2": [
      {
        "years": "2000-2005",
        "length": 3826,
        "width": 1673,
        "height": 1553,
        "weight": 2187
      }
    ],
    "A3 Sedan": [
      {
        "years": "2013-2020",
        "length": 4456,
        "width": 1796,
        "height": 1416,
        "weight": 2833
      },
      {
        "years": "2021-2026",
        "length": 4495,
        "width": 1816,
        "height": 1425,
        "weight": 2908
      }
    ],
    "A3 Sportback": [
      {
        "years": "2005-2012",
        "length": 4285,
        "width": 1765,
        "height": 1420,
        "weight": 2685
      },
      {
        "years": "2013-2020",
        "length": 4310,
        "width": 1785,
        "height": 1421,
        "weight": 2733
      },
      {
        "years": "2021-2026",
        "length": 4343,
        "width": 1816,
        "height": 1430,
        "weight": 2820
      }
    ],
    "A3 Cabriolet": [
      {
        "years": "2008-2013",
        "length": 4238,
        "width": 1777,
        "height": 1424,
        "weight": 2681
      },
      {
        "years": "2014-2020",
        "length": 4423,
        "width": 1793,
        "height": 1409,
        "weight": 2793
      }
    ],
    "A4 Sedan": [
      {
        "years": "2001-2008",
        "length": 4586,
        "width": 1772,
        "height": 1427,
        "weight": 3000
      },
      {
        "years": "2009-2015",
        "length": 4703,
        "width": 1826,
        "height": 1427,
        "weight": 3000
      },
      {
        "years": "2016-2024",
        "length": 4762,
        "width": 1842,
        "height": 1428,
        "weight": 3000
      }
    ],
    "A5 Coupe": [
      {
        "years": "2007-2016",
        "length": 4625,
        "width": 1854,
        "height": 1372,
        "weight": 3000
      },
      {
        "years": "2017-2024",
        "length": 4673,
        "width": 1846,
        "height": 1371,
        "weight": 3000
      }
    ],
    "A5 Sportback": [
      {
        "years": "2009-2016",
        "length": 4712,
        "width": 1854,
        "height": 1391,
        "weight": 3000
      },
      {
        "years": "2017-2024",
        "length": 4733,
        "width": 1843,
        "height": 1386,
        "weight": 3000
      }
    ],
    "A6 Sedan": [
      {
        "years": "2005-2011",
        "length": 4916,
        "width": 1855,
        "height": 1459,
        "weight": 3000
      },
      {
        "years": "2012-2018",
        "length": 4915,
        "width": 1874,
        "height": 1455,
        "weight": 3000
      },
      {
        "years": "2019-2026",
        "length": 4939,
        "width": 1886,
        "height": 1457,
        "weight": 3000
      }
    ],
    "A7 Sportback": [
      {
        "years": "2010-2017",
        "length": 4969,
        "width": 1911,
        "height": 1420,
        "weight": 3000
      },
      {
        "years": "2018-2026",
        "length": 4969,
        "width": 1908,
        "height": 1422,
        "weight": 3000
      }
    ],
    "A8": [
      {
        "years": "2010-2017",
        "length": 5137,
        "width": 1949,
        "height": 1460,
        "weight": 3000
      },
      {
        "years": "2018-2026",
        "length": 5172,
        "width": 1945,
        "height": 1473,
        "weight": 3000
      }
    ],
    "Q2": [
      {
        "years": "2016-2026",
        "length": 4191,
        "width": 1794,
        "height": 1508,
        "weight": 2835
      }
    ],
    "Q3 SUV": [
      {
        "years": "2012-2018",
        "length": 4385,
        "width": 1831,
        "height": 1608,
        "weight": 3000
      },
      {
        "years": "2019-2026",
        "length": 4484,
        "width": 1849,
        "height": 1616,
        "weight": 3000
      }
    ],
    "Q3 Sportback": [
      {
        "years": "2020-2026",
        "length": 4500,
        "width": 1843,
        "height": 1567,
        "weight": 3000
      }
    ],
    "Q4 e-tron": [
      {
        "years": "2021-2026",
        "length": 4588,
        "width": 1865,
        "height": 1632,
        "weight": 3000
      }
    ],
    "Q4 Sportback e-tron": [
      {
        "years": "2021-2026",
        "length": 4588,
        "width": 1865,
        "height": 1614,
        "weight": 3000
      }
    ],
    "Q5 SUV": [
      {
        "years": "2009-2017",
        "length": 4629,
        "width": 1880,
        "height": 1653,
        "weight": 3000
      },
      {
        "years": "2018-2024",
        "length": 4663,
        "width": 1893,
        "height": 1659,
        "weight": 3000
      },
      {
        "years": "2025-2026",
        "length": 4717,
        "width": 1900,
        "height": 1660,
        "weight": 3000
      }
    ],
    "Q5 Sportback": [
      {
        "years": "2021-2026",
        "length": 4689,
        "width": 1893,
        "height": 1660,
        "weight": 3000
      }
    ],
    "Q7": [
      {
        "years": "2006-2015",
        "length": 5086,
        "width": 1983,
        "height": 1737,
        "weight": 3000
      },
      {
        "years": "2016-2026",
        "length": 5063,
        "width": 1970,
        "height": 1741,
        "weight": 3000
      }
    ],
    "Q8": [
      {
        "years": "2019-2026",
        "length": 4986,
        "width": 1995,
        "height": 1705,
        "weight": 3000
      }
    ],
    "e-tron SUV": [
      {
        "years": "2019-2023",
        "length": 4901,
        "width": 1935,
        "height": 1616,
        "weight": 3000
      }
    ],
    "Q8 e-tron": [
      {
        "years": "2024-2026",
        "length": 4915,
        "width": 1937,
        "height": 1633,
        "weight": 3000
      }
    ],
    "e-tron GT": [
      {
        "years": "2021-2026",
        "length": 4989,
        "width": 1964,
        "height": 1413,
        "weight": 3000
      }
    ],
    "TT Coupe": [
      {
        "years": "2006-2014",
        "length": 4178,
        "width": 1842,
        "height": 1352,
        "weight": 2601
      },
      {
        "years": "2015-2023",
        "length": 4177,
        "width": 1832,
        "height": 1353,
        "weight": 2588
      }
    ],
    "R8": [
      {
        "years": "2007-2015",
        "length": 4431,
        "width": 1904,
        "height": 1249,
        "weight": 2634
      },
      {
        "years": "2016-2023",
        "length": 4426,
        "width": 1940,
        "height": 1240,
        "weight": 2662
      }
    ],
    "Allroad": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "Cabriolet": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "A4 Allroad": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "Coupe": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "E-tron": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "A6 Allroad": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "Q5 E": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "A8 E": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "A8 L": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "A7 E": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ],
    "A8 L E": [
      {
        "years": "2000-2026",
        "length": 4900,
        "width": 1850,
        "height": 1450,
        "weight": 3000
      }
    ]
  },
  "Renault": {
    "Kwid": [
      {
        "years": "2019-2026",
        "length": 3679,
        "width": 1579,
        "height": 1478,
        "weight": 1889
      }
    ],
    "Kwid E-Tech": [
      {
        "years": "2022-2026",
        "length": 3734,
        "width": 1579,
        "height": 1516,
        "weight": 1966
      }
    ],
    "Kardian": [
      {
        "years": "2024-2026",
        "length": 4119,
        "width": 1773,
        "height": 1544,
        "weight": 2819
      }
    ],
    "Sandero": [
      {
        "years": "2008-2012",
        "length": 4020,
        "width": 1746,
        "height": 1534,
        "weight": 2692
      },
      {
        "years": "2013-2020",
        "length": 4060,
        "width": 1733,
        "height": 1523,
        "weight": 2679
      },
      {
        "years": "2021-2026",
        "length": 4088,
        "width": 1777,
        "height": 1499,
        "weight": 2722
      }
    ],
    "Stepway": [
      {
        "years": "2009-2012",
        "length": 4091,
        "width": 1751,
        "height": 1640,
        "weight": 2937
      },
      {
        "years": "2013-2020",
        "length": 4066,
        "width": 1761,
        "height": 1559,
        "weight": 2791
      },
      {
        "years": "2021-2026",
        "length": 4099,
        "width": 1777,
        "height": 1535,
        "weight": 2795
      }
    ],
    "Logan": [
      {
        "years": "2005-2013",
        "length": 4250,
        "width": 1740,
        "height": 1525,
        "weight": 2819
      },
      {
        "years": "2014-2026",
        "length": 4349,
        "width": 1733,
        "height": 1517,
        "weight": 2858
      }
    ],
    "Clio": [
      {
        "years": "1998-2012",
        "length": 3811,
        "width": 1639,
        "height": 1417,
        "weight": 1947
      },
      {
        "years": "2013-2019",
        "length": 4062,
        "width": 1732,
        "height": 1448,
        "weight": 2547
      },
      {
        "years": "2020-2026",
        "length": 4050,
        "width": 1798,
        "height": 1440,
        "weight": 2621
      }
    ],
    "Megane": [
      {
        "years": "2003-2009",
        "length": 4498,
        "width": 1777,
        "height": 1460,
        "weight": 2917
      },
      {
        "years": "2010-2016",
        "length": 4295,
        "width": 1808,
        "height": 1471,
        "weight": 2856
      },
      {
        "years": "2017-2024",
        "length": 4359,
        "width": 1814,
        "height": 1438,
        "weight": 2843
      }
    ],
    "Megane E-Tech": [
      {
        "years": "2022-2026",
        "length": 4199,
        "width": 1764,
        "height": 1505,
        "weight": 2787
      }
    ],
    "Fluence": [
      {
        "years": "2010-2018",
        "length": 4618,
        "width": 1809,
        "height": 1479,
        "weight": 3000
      }
    ],
    "Talisman": [
      {
        "years": "2015-2022",
        "length": 4848,
        "width": 1869,
        "height": 1463,
        "weight": 3000
      }
    ],
    "Captur": [
      {
        "years": "2013-2019",
        "length": 4122,
        "width": 1778,
        "height": 1566,
        "weight": 2869
      },
      {
        "years": "2020-2026",
        "length": 4227,
        "width": 1797,
        "height": 1576,
        "weight": 2993
      }
    ],
    "Duster": [
      {
        "years": "2012-2017",
        "length": 4315,
        "width": 1822,
        "height": 1690,
        "weight": 3000
      },
      {
        "years": "2018-2023",
        "length": 4341,
        "width": 1804,
        "height": 1693,
        "weight": 3000
      },
      {
        "years": "2024-2026",
        "length": 4343,
        "width": 1810,
        "height": 1660,
        "weight": 3000
      }
    ],
    "Oroch": [
      {
        "years": "2016-2026",
        "length": 4700,
        "width": 1821,
        "height": 1694,
        "weight": 3000
      }
    ],
    "Koleos": [
      {
        "years": "2008-2016",
        "length": 4520,
        "width": 1855,
        "height": 1695,
        "weight": 3000
      },
      {
        "years": "2017-2026",
        "length": 4673,
        "width": 1843,
        "height": 1678,
        "weight": 3000
      }
    ],
    "Austral": [
      {
        "years": "2022-2026",
        "length": 4510,
        "width": 1825,
        "height": 1618,
        "weight": 3000
      }
    ],
    "Arkana": [
      {
        "years": "2021-2026",
        "length": 4568,
        "width": 1821,
        "height": 1571,
        "weight": 3000
      }
    ],
    "Rafale": [
      {
        "years": "2024-2026",
        "length": 4710,
        "width": 1866,
        "height": 1613,
        "weight": 3000
      }
    ],
    "Symbioz": [
      {
        "years": "2024-2026",
        "length": 4413,
        "width": 1797,
        "height": 1575,
        "weight": 3000
      }
    ],
    "Scenic": [
      {
        "years": "2003-2009",
        "length": 4259,
        "width": 1810,
        "height": 1620,
        "weight": 3000
      },
      {
        "years": "2010-2016",
        "length": 4344,
        "width": 1845,
        "height": 1637,
        "weight": 3000
      },
      {
        "years": "2017-2022",
        "length": 4406,
        "width": 1866,
        "height": 1653,
        "weight": 3000
      }
    ],
    "Scenic E-Tech": [
      {
        "years": "2024-2026",
        "length": 4470,
        "width": 1864,
        "height": 1570,
        "weight": 3000
      }
    ],
    "Espace": [
      {
        "years": "2015-2023",
        "length": 4857,
        "width": 1888,
        "height": 1677,
        "weight": 3000
      },
      {
        "years": "2024-2026",
        "length": 4722,
        "width": 1843,
        "height": 1645,
        "weight": 3000
      }
    ],
    "Alaskan": [
      {
        "years": "2017-2026",
        "length": 5330,
        "width": 1850,
        "height": 1819,
        "weight": 3000
      }
    ],
    "Zoe": [
      {
        "years": "2012-2024",
        "length": 4084,
        "width": 1730,
        "height": 1562,
        "weight": 2759
      }
    ],
    "Twizy": [
      {
        "years": "2012-2023",
        "length": 2338,
        "width": 1237,
        "height": 1454,
        "weight": 925
      }
    ],
    "Kangoo": [
      {
        "years": "1997-2007",
        "length": 3995,
        "width": 1663,
        "height": 1827,
        "weight": 2670
      },
      {
        "years": "2008-2020",
        "length": 4213,
        "width": 1829,
        "height": 1803,
        "weight": 3000
      },
      {
        "years": "2021-2026",
        "length": 4486,
        "width": 1919,
        "height": 1838,
        "weight": 3000
      }
    ],
    "Express": [
      {
        "years": "2021-2026",
        "length": 4393,
        "width": 1775,
        "height": 1811,
        "weight": 3000
      }
    ],
    "Trafic": [
      {
        "years": "2014-2026",
        "length": 4999,
        "width": 1956,
        "height": 1971,
        "weight": 3000
      }
    ],
    "Master": [
      {
        "years": "2010-2024",
        "length": 5048,
        "width": 2070,
        "height": 2307,
        "weight": 3000
      },
      {
        "years": "2025-2026",
        "length": 5310,
        "width": 2080,
        "height": 2310,
        "weight": 3000
      }
    ],
    "Lecar": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "18i": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Fuego": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Alliance": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Encore": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ]
  },
  "Peugeot": {
    "107": [
      {
        "years": "2005-2014",
        "length": 3430,
        "width": 1630,
        "height": 1470,
        "weight": 1808
      }
    ],
    "108": [
      {
        "years": "2014-2021",
        "length": 3475,
        "width": 1615,
        "height": 1460,
        "weight": 1803
      }
    ],
    "206": [
      {
        "years": "1998-2012",
        "length": 3835,
        "width": 1652,
        "height": 1428,
        "weight": 1990
      }
    ],
    "207": [
      {
        "years": "2006-2014",
        "length": 4030,
        "width": 1720,
        "height": 1472,
        "weight": 2551
      }
    ],
    "208": [
      {
        "years": "2013-2019",
        "length": 3963,
        "width": 1739,
        "height": 1460,
        "weight": 2214
      },
      {
        "years": "2020-2026",
        "length": 4055,
        "width": 1745,
        "height": 1430,
        "weight": 2530
      }
    ],
    "301": [
      {
        "years": "2012-2023",
        "length": 4442,
        "width": 1748,
        "height": 1466,
        "weight": 2846
      }
    ],
    "408": [
      {
        "years": "2023-2026",
        "length": 4687,
        "width": 1848,
        "height": 1478,
        "weight": 3000
      }
    ],
    "508": [
      {
        "years": "2011-2018",
        "length": 4792,
        "width": 1853,
        "height": 1456,
        "weight": 3000
      },
      {
        "years": "2019-2026",
        "length": 4750,
        "width": 1859,
        "height": 1403,
        "weight": 3000
      }
    ],
    "2008": [
      {
        "years": "2014-2019",
        "length": 4159,
        "width": 1739,
        "height": 1550,
        "weight": 2803
      },
      {
        "years": "2020-2026",
        "length": 4300,
        "width": 1770,
        "height": 1530,
        "weight": 2911
      }
    ],
    "3008": [
      {
        "years": "2009-2016",
        "length": 4365,
        "width": 1837,
        "height": 1639,
        "weight": 3000
      },
      {
        "years": "2017-2023",
        "length": 4447,
        "width": 1841,
        "height": 1620,
        "weight": 3000
      },
      {
        "years": "2024-2026",
        "length": 4540,
        "width": 1895,
        "height": 1640,
        "weight": 3000
      }
    ],
    "5008": [
      {
        "years": "2009-2016",
        "length": 4529,
        "width": 1837,
        "height": 1647,
        "weight": 3000
      },
      {
        "years": "2017-2023",
        "length": 4641,
        "width": 1844,
        "height": 1640,
        "weight": 3000
      },
      {
        "years": "2024-2026",
        "length": 4790,
        "width": 1895,
        "height": 1690,
        "weight": 3000
      }
    ],
    "e-208": [
      {
        "years": "2020-2026",
        "length": 4055,
        "width": 1745,
        "height": 1430,
        "weight": 2530
      }
    ],
    "308 Hatchback": [
      {
        "years": "2008-2013",
        "length": 4276,
        "width": 1815,
        "height": 1498,
        "weight": 2906
      },
      {
        "years": "2014-2021",
        "length": 4253,
        "width": 1804,
        "height": 1457,
        "weight": 2795
      },
      {
        "years": "2022-2026",
        "length": 4367,
        "width": 1852,
        "height": 1441,
        "weight": 2914
      }
    ],
    "308 SW": [
      {
        "years": "2008-2013",
        "length": 4500,
        "width": 1815,
        "height": 1555,
        "weight": 3000
      },
      {
        "years": "2014-2021",
        "length": 4585,
        "width": 1804,
        "height": 1471,
        "weight": 3000
      },
      {
        "years": "2022-2026",
        "length": 4636,
        "width": 1852,
        "height": 1442,
        "weight": 3000
      }
    ],
    "407 Sedan": [
      {
        "years": "2004-2011",
        "length": 4676,
        "width": 1811,
        "height": 1445,
        "weight": 3000
      }
    ],
    "e-2008": [
      {
        "years": "2020-2026",
        "length": 4300,
        "width": 1770,
        "height": 1530,
        "weight": 2911
      }
    ],
    "Landtrek": [
      {
        "years": "2020-2026",
        "length": 5330,
        "width": 1963,
        "height": 1897,
        "weight": 3000
      }
    ],
    "Rifter": [
      {
        "years": "2018-2026",
        "length": 4403,
        "width": 1848,
        "height": 1874,
        "weight": 3000
      }
    ]
  },
  "Land Rover": {
    "Defender 90": [
      {
        "years": "1983-2016",
        "length": 3883,
        "width": 1790,
        "height": 1963,
        "weight": 3000
      },
      {
        "years": "2020-2026",
        "length": 4323,
        "width": 1996,
        "height": 1974,
        "weight": 3000
      }
    ],
    "Defender 110": [
      {
        "years": "1983-2016",
        "length": 4599,
        "width": 1790,
        "height": 2026,
        "weight": 3000
      },
      {
        "years": "2020-2026",
        "length": 4758,
        "width": 1996,
        "height": 1967,
        "weight": 3000
      }
    ],
    "Defender 130": [
      {
        "years": "2022-2026",
        "length": 5358,
        "width": 1996,
        "height": 1970,
        "weight": 3000
      }
    ],
    "Discovery": [
      {
        "years": "1998-2004",
        "length": 4705,
        "width": 1885,
        "height": 1940,
        "weight": 3000
      },
      {
        "years": "2004-2009",
        "length": 4835,
        "width": 1915,
        "height": 1887,
        "weight": 3000
      },
      {
        "years": "2010-2016",
        "length": 4829,
        "width": 1915,
        "height": 1882,
        "weight": 3000
      },
      {
        "years": "2017-2026",
        "length": 4956,
        "width": 2000,
        "height": 1888,
        "weight": 3000
      }
    ],
    "Discovery Sport": [
      {
        "years": "2015-2019",
        "length": 4599,
        "width": 1894,
        "height": 1724,
        "weight": 3000
      },
      {
        "years": "2020-2026",
        "length": 4597,
        "width": 1904,
        "height": 1727,
        "weight": 3000
      }
    ],
    "Freelander": [
      {
        "years": "1997-2006",
        "length": 4382,
        "width": 1811,
        "height": 1757,
        "weight": 3000
      },
      {
        "years": "2006-2015",
        "length": 4500,
        "width": 1910,
        "height": 1740,
        "weight": 3000
      }
    ],
    "Range Rover": [
      {
        "years": "1970-1995",
        "length": 4445,
        "width": 1781,
        "height": 1781,
        "weight": 3000
      },
      {
        "years": "2002-2012",
        "length": 4950,
        "width": 1923,
        "height": 1863,
        "weight": 3000
      },
      {
        "years": "2013-2021",
        "length": 5000,
        "width": 1983,
        "height": 1835,
        "weight": 3000
      },
      {
        "years": "2022-2026",
        "length": 5052,
        "width": 2047,
        "height": 1870,
        "weight": 3000
      }
    ],
    "Range Rover LWB": [
      {
        "years": "2014-2021",
        "length": 5200,
        "width": 1983,
        "height": 1840,
        "weight": 3000
      },
      {
        "years": "2022-2026",
        "length": 5252,
        "width": 2047,
        "height": 1870,
        "weight": 3000
      }
    ],
    "Range Rover Sport": [
      {
        "years": "2005-2013",
        "length": 4783,
        "width": 1928,
        "height": 1784,
        "weight": 3000
      },
      {
        "years": "2014-2022",
        "length": 4879,
        "width": 1983,
        "height": 1803,
        "weight": 3000
      },
      {
        "years": "2023-2026",
        "length": 4946,
        "width": 2047,
        "height": 1820,
        "weight": 3000
      }
    ],
    "Range Rover Velar": [
      {
        "years": "2017-2026",
        "length": 4797,
        "width": 1930,
        "height": 1683,
        "weight": 3000
      }
    ],
    "Range Rover Evoque": [
      {
        "years": "2011-2018",
        "length": 4370,
        "width": 1900,
        "height": 1635,
        "weight": 3000
      },
      {
        "years": "2019-2026",
        "length": 4371,
        "width": 1904,
        "height": 1649,
        "weight": 3000
      }
    ],
    "Range Rover Evoque Coupe": [
      {
        "years": "2011-2018",
        "length": 4355,
        "width": 1900,
        "height": 1605,
        "weight": 3000
      }
    ],
    "Defender": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "New Range Rover": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "110\" Wb": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "90\" Wb": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "88” Wb": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ]
  },
  "Porsche": {
    "911 Carrera": [
      {
        "years": "1998-2004",
        "length": 4430,
        "width": 1765,
        "height": 1305,
        "weight": 2551
      },
      {
        "years": "2005-2011",
        "length": 4435,
        "width": 1808,
        "height": 1310,
        "weight": 2626
      },
      {
        "years": "2012-2018",
        "length": 4491,
        "width": 1808,
        "height": 1303,
        "weight": 2645
      },
      {
        "years": "2019-2026",
        "length": 4519,
        "width": 1852,
        "height": 1298,
        "weight": 3000
      }
    ],
    "911 Turbo": [
      {
        "years": "2001-2005",
        "length": 4435,
        "width": 1830,
        "height": 1295,
        "weight": 2628
      },
      {
        "years": "2006-2012",
        "length": 4450,
        "width": 1852,
        "height": 1300,
        "weight": 2678
      },
      {
        "years": "2013-2020",
        "length": 4506,
        "width": 1880,
        "height": 1294,
        "weight": 3000
      },
      {
        "years": "2021-2026",
        "length": 4535,
        "width": 1900,
        "height": 1303,
        "weight": 3000
      }
    ],
    "911 GT3": [
      {
        "years": "1999-2005",
        "length": 4435,
        "width": 1770,
        "height": 1275,
        "weight": 2502
      },
      {
        "years": "2006-2011",
        "length": 4445,
        "width": 1808,
        "height": 1280,
        "weight": 2572
      },
      {
        "years": "2013-2019",
        "length": 4545,
        "width": 1852,
        "height": 1269,
        "weight": 2991
      },
      {
        "years": "2021-2026",
        "length": 4573,
        "width": 1852,
        "height": 1279,
        "weight": 3000
      }
    ],
    "911 GT3 RS": [
      {
        "years": "2003-2005",
        "length": 4435,
        "width": 1770,
        "height": 1280,
        "weight": 2512
      },
      {
        "years": "2006-2012",
        "length": 4460,
        "width": 1852,
        "height": 1280,
        "weight": 2643
      },
      {
        "years": "2015-2019",
        "length": 4557,
        "width": 1880,
        "height": 1291,
        "weight": 3000
      },
      {
        "years": "2023-2026",
        "length": 4572,
        "width": 1900,
        "height": 1322,
        "weight": 3000
      }
    ],
    "Taycan": [
      {
        "years": "2020-2026",
        "length": 4963,
        "width": 1966,
        "height": 1378,
        "weight": 3000
      }
    ],
    "Taycan Cross Turismo": [
      {
        "years": "2021-2026",
        "length": 4974,
        "width": 1967,
        "height": 1409,
        "weight": 3000
      }
    ],
    "Panamera": [
      {
        "years": "2010-2016",
        "length": 4970,
        "width": 1931,
        "height": 1418,
        "weight": 3000
      },
      {
        "years": "2017-2023",
        "length": 5049,
        "width": 1937,
        "height": 1423,
        "weight": 3000
      },
      {
        "years": "2024-2026",
        "length": 5052,
        "width": 1937,
        "height": 1423,
        "weight": 3000
      }
    ],
    "Panamera Executive": [
      {
        "years": "2017-2026",
        "length": 5199,
        "width": 1937,
        "height": 1428,
        "weight": 3000
      }
    ],
    "Macan": [
      {
        "years": "2014-2024",
        "length": 4681,
        "width": 1923,
        "height": 1624,
        "weight": 3000
      }
    ],
    "Macan Electric": [
      {
        "years": "2024-2026",
        "length": 4784,
        "width": 1938,
        "height": 1622,
        "weight": 3000
      }
    ],
    "Cayenne": [
      {
        "years": "2003-2010",
        "length": 4782,
        "width": 1928,
        "height": 1699,
        "weight": 3000
      },
      {
        "years": "2011-2017",
        "length": 4846,
        "width": 1939,
        "height": 1705,
        "weight": 3000
      },
      {
        "years": "2018-2025",
        "length": 4918,
        "width": 1983,
        "height": 1696,
        "weight": 3000
      }
    ],
    "Cayenne Electric": [
      {
        "years": "2026-2026",
        "length": 4930,
        "width": 1985,
        "height": 1698,
        "weight": 3000
      }
    ],
    "Cayenne Coupe": [
      {
        "years": "2019-2026",
        "length": 4931,
        "width": 1983,
        "height": 1676,
        "weight": 3000
      }
    ],
    "718 Boxster": [
      {
        "years": "2016-2026",
        "length": 4379,
        "width": 1801,
        "height": 1281,
        "weight": 2526
      }
    ],
    "718 Cayman": [
      {
        "years": "2016-2026",
        "length": 4379,
        "width": 1801,
        "height": 1295,
        "weight": 2553
      }
    ],
    "718 Cayman GT4 RS": [
      {
        "years": "2022-2026",
        "length": 4456,
        "width": 1822,
        "height": 1267,
        "weight": 2572
      }
    ],
    "Boxster (Legacy)": [
      {
        "years": "1996-2004",
        "length": 4320,
        "width": 1780,
        "height": 1290,
        "weight": 2480
      },
      {
        "years": "2005-2012",
        "length": 4342,
        "width": 1801,
        "height": 1292,
        "weight": 2526
      },
      {
        "years": "2013-2016",
        "length": 4374,
        "width": 1801,
        "height": 1282,
        "weight": 2525
      }
    ],
    "Cayman (Legacy)": [
      {
        "years": "2005-2012",
        "length": 4341,
        "width": 1801,
        "height": 1305,
        "weight": 2551
      },
      {
        "years": "2013-2016",
        "length": 4380,
        "width": 1801,
        "height": 1294,
        "weight": 2552
      }
    ],
    "Cayman": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "718 Spyder": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ]
  },
  "Volvo": {
    "240 / 244": [
      {
        "years": "1974-1993",
        "length": 4785,
        "width": 1710,
        "height": 1460,
        "weight": 3000
      }
    ],
    "850 Sedan": [
      {
        "years": "1991-1997",
        "length": 4661,
        "width": 1760,
        "height": 1400,
        "weight": 3000
      }
    ],
    "850 Wagon": [
      {
        "years": "1992-1997",
        "length": 4710,
        "width": 1760,
        "height": 1445,
        "weight": 3000
      }
    ],
    "940 / 960": [
      {
        "years": "1990-1998",
        "length": 4870,
        "width": 1750,
        "height": 1410,
        "weight": 3000
      }
    ],
    "C30": [
      {
        "years": "2006-2013",
        "length": 4252,
        "width": 1782,
        "height": 1447,
        "weight": 2741
      }
    ],
    "C40 Recharge": [
      {
        "years": "2022-2024",
        "length": 4440,
        "width": 1873,
        "height": 1591,
        "weight": 3000
      }
    ],
    "C70": [
      {
        "years": "1997-2005",
        "length": 4716,
        "width": 1817,
        "height": 1400,
        "weight": 3000
      },
      {
        "years": "2006-2013",
        "length": 4582,
        "width": 1817,
        "height": 1400,
        "weight": 3000
      }
    ],
    "EC40": [
      {
        "years": "2024-2026",
        "length": 4440,
        "width": 1873,
        "height": 1591,
        "weight": 3000
      }
    ],
    "EM90": [
      {
        "years": "2024-2026",
        "length": 5206,
        "width": 2024,
        "height": 1859,
        "weight": 3000
      }
    ],
    "ES90": [
      {
        "years": "2025-2026",
        "length": 4999,
        "width": 1945,
        "height": 1547,
        "weight": 3000
      }
    ],
    "EX30": [
      {
        "years": "2024-2026",
        "length": 4233,
        "width": 1836,
        "height": 1555,
        "weight": 3000
      }
    ],
    "EX40": [
      {
        "years": "2024-2026",
        "length": 4440,
        "width": 1873,
        "height": 1651,
        "weight": 3000
      }
    ],
    "EX60": [
      {
        "years": "2025-2026",
        "length": 4712,
        "width": 1902,
        "height": 1660,
        "weight": 3000
      }
    ],
    "EX90": [
      {
        "years": "2024-2026",
        "length": 5037,
        "width": 1964,
        "height": 1747,
        "weight": 3000
      }
    ],
    "S40": [
      {
        "years": "1995-2004",
        "length": 4480,
        "width": 1720,
        "height": 1410,
        "weight": 2716
      },
      {
        "years": "2004-2012",
        "length": 4468,
        "width": 1770,
        "height": 1452,
        "weight": 2871
      }
    ],
    "S60": [
      {
        "years": "2000-2009",
        "length": 4576,
        "width": 1804,
        "height": 1428,
        "weight": 3000
      },
      {
        "years": "2010-2018",
        "length": 4628,
        "width": 1865,
        "height": 1484,
        "weight": 3000
      },
      {
        "years": "2019-2026",
        "length": 4761,
        "width": 1850,
        "height": 1431,
        "weight": 3000
      }
    ],
    "S70": [
      {
        "years": "1996-2000",
        "length": 4720,
        "width": 1760,
        "height": 1400,
        "weight": 3000
      }
    ],
    "S80": [
      {
        "years": "1998-2006",
        "length": 4820,
        "width": 1830,
        "height": 1430,
        "weight": 3000
      },
      {
        "years": "2006-2016",
        "length": 4851,
        "width": 1860,
        "height": 1490,
        "weight": 3000
      }
    ],
    "S90": [
      {
        "years": "2017-2026",
        "length": 4963,
        "width": 1879,
        "height": 1443,
        "weight": 3000
      }
    ],
    "V40": [
      {
        "years": "2013-2019",
        "length": 4369,
        "width": 1802,
        "height": 1445,
        "weight": 2844
      }
    ],
    "V40 Cross Country": [
      {
        "years": "2013-2019",
        "length": 4370,
        "width": 1802,
        "height": 1458,
        "weight": 2870
      }
    ],
    "V50": [
      {
        "years": "2004-2012",
        "length": 4512,
        "width": 1770,
        "height": 1452,
        "weight": 3000
      }
    ],
    "V60": [
      {
        "years": "2010-2018",
        "length": 4635,
        "width": 1865,
        "height": 1484,
        "weight": 3000
      },
      {
        "years": "2019-2026",
        "length": 4761,
        "width": 1850,
        "height": 1427,
        "weight": 3000
      }
    ],
    "V60 Cross Country": [
      {
        "years": "2019-2026",
        "length": 4784,
        "width": 1850,
        "height": 1499,
        "weight": 3000
      }
    ],
    "V70": [
      {
        "years": "1996-2000",
        "length": 4720,
        "width": 1760,
        "height": 1430,
        "weight": 3000
      },
      {
        "years": "2000-2007",
        "length": 4710,
        "width": 1800,
        "height": 1460,
        "weight": 3000
      },
      {
        "years": "2008-2016",
        "length": 4823,
        "width": 1861,
        "height": 1547,
        "weight": 3000
      }
    ],
    "V90": [
      {
        "years": "2017-2026",
        "length": 4936,
        "width": 1879,
        "height": 1475,
        "weight": 3000
      }
    ],
    "V90 Cross Country": [
      {
        "years": "2017-2026",
        "length": 4939,
        "width": 1879,
        "height": 1543,
        "weight": 3000
      }
    ],
    "XC40": [
      {
        "years": "2018-2026",
        "length": 4425,
        "width": 1863,
        "height": 1652,
        "weight": 3000
      }
    ],
    "XC60": [
      {
        "years": "2008-2017",
        "length": 4628,
        "width": 1891,
        "height": 1713,
        "weight": 3000
      },
      {
        "years": "2018-2026",
        "length": 4708,
        "width": 1902,
        "height": 1658,
        "weight": 3000
      }
    ],
    "XC70": [
      {
        "years": "2000-2007",
        "length": 4733,
        "width": 1860,
        "height": 1562,
        "weight": 3000
      },
      {
        "years": "2007-2016",
        "length": 4838,
        "width": 1870,
        "height": 1604,
        "weight": 3000
      }
    ],
    "XC90": [
      {
        "years": "2002-2014",
        "length": 4807,
        "width": 1898,
        "height": 1784,
        "weight": 3000
      },
      {
        "years": "2015-2026",
        "length": 4953,
        "width": 1923,
        "height": 1776,
        "weight": 3000
      }
    ],
    "S60 Cross Country": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Cab Over Engine Ht": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Cab Over Engine Lt": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "F12 W/f7 Cab": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "F6 W/f7 Cab": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Cab Behind Engine": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "C70 / C30": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Ex30 Cc": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ]
  },
  "Ferrari": {
    "F355": [
      {
        "years": "1994-1999",
        "length": 4250,
        "width": 1900,
        "height": 1170,
        "weight": 2362
      }
    ],
    "F40": [
      {
        "years": "1987-1992",
        "length": 4358,
        "width": 1970,
        "height": 1124,
        "weight": 2412
      }
    ],
    "360 Modena": [
      {
        "years": "1999-2005",
        "length": 4477,
        "width": 1922,
        "height": 1214,
        "weight": 2612
      }
    ],
    "F50": [
      {
        "years": "1995-1997",
        "length": 4480,
        "width": 1986,
        "height": 1120,
        "weight": 2491
      }
    ],
    "Testarossa": [
      {
        "years": "1984-1991",
        "length": 4485,
        "width": 1976,
        "height": 1130,
        "weight": 2504
      }
    ],
    "F430": [
      {
        "years": "2004-2009",
        "length": 4512,
        "width": 1923,
        "height": 1214,
        "weight": 2949
      }
    ],
    "430 Scuderia": [
      {
        "years": "2007-2009",
        "length": 4512,
        "width": 1923,
        "height": 1199,
        "weight": 2913
      }
    ],
    "458 Italia": [
      {
        "years": "2009-2015",
        "length": 4527,
        "width": 1937,
        "height": 1213,
        "weight": 2978
      }
    ],
    "California": [
      {
        "years": "2008-2014",
        "length": 4562,
        "width": 1900,
        "height": 1322,
        "weight": 3000
      }
    ],
    "296 GTB": [
      {
        "years": "2022-2026",
        "length": 4565,
        "width": 1958,
        "height": 1187,
        "weight": 2971
      }
    ],
    "488 GTB": [
      {
        "years": "2015-2019",
        "length": 4568,
        "width": 1952,
        "height": 1213,
        "weight": 3000
      }
    ],
    "California T": [
      {
        "years": "2014-2017",
        "length": 4570,
        "width": 1910,
        "height": 1322,
        "weight": 3000
      }
    ],
    "Portofino": [
      {
        "years": "2017-2023",
        "length": 4586,
        "width": 1938,
        "height": 1318,
        "weight": 3000
      }
    ],
    "Portofino M": [
      {
        "years": "2020-2023",
        "length": 4594,
        "width": 1938,
        "height": 1318,
        "weight": 3000
      }
    ],
    "488 Pista": [
      {
        "years": "2018-2020",
        "length": 4605,
        "width": 1975,
        "height": 1206,
        "weight": 3000
      }
    ],
    "F8 Tributo": [
      {
        "years": "2019-2023",
        "length": 4611,
        "width": 1979,
        "height": 1206,
        "weight": 3000
      }
    ],
    "F12berlinetta": [
      {
        "years": "2012-2017",
        "length": 4618,
        "width": 1942,
        "height": 1273,
        "weight": 3000
      }
    ],
    "Roma": [
      {
        "years": "2020-2026",
        "length": 4656,
        "width": 1974,
        "height": 1301,
        "weight": 3000
      }
    ],
    "812 Superfast": [
      {
        "years": "2017-2024",
        "length": 4657,
        "width": 1971,
        "height": 1276,
        "weight": 3000
      }
    ],
    "599 GTB Fiorano": [
      {
        "years": "2006-2012",
        "length": 4665,
        "width": 1962,
        "height": 1336,
        "weight": 3000
      }
    ],
    "Daytona SP3": [
      {
        "years": "2022-2024",
        "length": 4685,
        "width": 2050,
        "height": 1142,
        "weight": 3000
      }
    ],
    "LaFerrari": [
      {
        "years": "2013-2016",
        "length": 4702,
        "width": 1992,
        "height": 1116,
        "weight": 2927
      }
    ],
    "Enzo": [
      {
        "years": "2002-2004",
        "length": 4702,
        "width": 2035,
        "height": 1147,
        "weight": 3000
      }
    ],
    "SF90 Stradale": [
      {
        "years": "2019-2026",
        "length": 4710,
        "width": 1972,
        "height": 1186,
        "weight": 3000
      }
    ],
    "12Cilindri": [
      {
        "years": "2024-2026",
        "length": 4733,
        "width": 1976,
        "height": 1292,
        "weight": 3000
      }
    ],
    "SF90 XX": [
      {
        "years": "2023-2025",
        "length": 4850,
        "width": 2014,
        "height": 1225,
        "weight": 3000
      }
    ],
    "FF": [
      {
        "years": "2011-2016",
        "length": 4907,
        "width": 1953,
        "height": 1379,
        "weight": 3000
      }
    ],
    "GTC4Lusso": [
      {
        "years": "2016-2020",
        "length": 4922,
        "width": 1980,
        "height": 1383,
        "weight": 3000
      }
    ],
    "Purosangue": [
      {
        "years": "2023-2026",
        "length": 4973,
        "width": 2028,
        "height": 1589,
        "weight": 3000
      }
    ],
    "612 Scaglietti": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "575m Maranello": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "550 Maranello": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "F12 Berlinetta": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "La Ferrari": [
      {
        "years": "2000-2026",
        "length": 4600,
        "width": 1900,
        "height": 1350,
        "weight": 3000
      }
    ],
    "348 Tb": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "348 Ts": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "512 Tr": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "355 Berlinetta": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "348 Spider": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "355 Spider": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Mondial T": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "3.2 Mondial": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Mondial 8": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "F60 America": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "F12 Tdf (tour De France)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "550 Barchetta": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Monza Sp1/sp2": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ]
  },
  "Lamborghini": {
    "Gallardo": [
      {
        "years": "2003-2013",
        "length": 4345,
        "width": 1900,
        "height": 1165,
        "weight": 2404
      }
    ],
    "Huracán LP610-4": [
      {
        "years": "2014-2019",
        "length": 4459,
        "width": 1924,
        "height": 1165,
        "weight": 2499
      }
    ],
    "Diablo": [
      {
        "years": "1990-2001",
        "length": 4460,
        "width": 2040,
        "height": 1105,
        "weight": 2513
      }
    ],
    "Huracán EVO": [
      {
        "years": "2019-2024",
        "length": 4520,
        "width": 1933,
        "height": 1165,
        "weight": 2850
      }
    ],
    "Huracán Sterrato": [
      {
        "years": "2023-2024",
        "length": 4525,
        "width": 1956,
        "height": 1248,
        "weight": 3000
      }
    ],
    "Huracán STO": [
      {
        "years": "2021-2024",
        "length": 4549,
        "width": 1945,
        "height": 1220,
        "weight": 3000
      }
    ],
    "Murciélago": [
      {
        "years": "2001-2010",
        "length": 4580,
        "width": 2045,
        "height": 1135,
        "weight": 2977
      }
    ],
    "Temerario": [
      {
        "years": "2025-2026",
        "length": 4706,
        "width": 1996,
        "height": 1201,
        "weight": 3000
      }
    ],
    "Aventador LP700-4": [
      {
        "years": "2011-2016",
        "length": 4780,
        "width": 2030,
        "height": 1136,
        "weight": 3000
      }
    ],
    "Aventador S": [
      {
        "years": "2017-2022",
        "length": 4797,
        "width": 2030,
        "height": 1136,
        "weight": 3000
      }
    ],
    "Countach LPI 800-4": [
      {
        "years": "2022-2023",
        "length": 4870,
        "width": 2099,
        "height": 1139,
        "weight": 3000
      }
    ],
    "Aventador SVJ": [
      {
        "years": "2018-2022",
        "length": 4943,
        "width": 2098,
        "height": 1136,
        "weight": 3000
      }
    ],
    "Revuelto": [
      {
        "years": "2023-2026",
        "length": 4947,
        "width": 2033,
        "height": 1160,
        "weight": 3000
      }
    ],
    "Sian FKP 37": [
      {
        "years": "2020-2022",
        "length": 4980,
        "width": 2101,
        "height": 1133,
        "weight": 3000
      }
    ],
    "Urus": [
      {
        "years": "2018-2022",
        "length": 5112,
        "width": 2016,
        "height": 1638,
        "weight": 3000
      }
    ],
    "Urus SE": [
      {
        "years": "2024-2026",
        "length": 5123,
        "width": 2022,
        "height": 1638,
        "weight": 3000
      }
    ],
    "Urus Performante": [
      {
        "years": "2023-2026",
        "length": 5137,
        "width": 2026,
        "height": 1618,
        "weight": 3000
      }
    ],
    "Murcielago": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Aventador": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Huracan": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ]
  },
  "McLaren": {
    "540C": [
      {
        "years": "2015-2021",
        "length": 4529,
        "width": 1915,
        "height": 1201,
        "weight": 2917
      }
    ],
    "570S": [
      {
        "years": "2015-2021",
        "length": 4529,
        "width": 1915,
        "height": 1201,
        "weight": 2917
      }
    ],
    "570GT": [
      {
        "years": "2016-2021",
        "length": 4530,
        "width": 1915,
        "height": 1201,
        "weight": 2917
      }
    ],
    "Artura": [
      {
        "years": "2022-2026",
        "length": 4539,
        "width": 1913,
        "height": 1193,
        "weight": 2901
      }
    ],
    "720S": [
      {
        "years": "2017-2023",
        "length": 4544,
        "width": 1930,
        "height": 1196,
        "weight": 2937
      }
    ],
    "750S": [
      {
        "years": "2023-2026",
        "length": 4569,
        "width": 1930,
        "height": 1196,
        "weight": 2953
      }
    ],
    "P1": [
      {
        "years": "2013-2015",
        "length": 4588,
        "width": 1946,
        "height": 1188,
        "weight": 2970
      }
    ],
    "600LT": [
      {
        "years": "2018-2021",
        "length": 4604,
        "width": 1915,
        "height": 1194,
        "weight": 2948
      }
    ],
    "650S": [
      {
        "years": "2014-2017",
        "length": 4612,
        "width": 1908,
        "height": 1199,
        "weight": 2954
      }
    ],
    "W1": [
      {
        "years": "2025-2026",
        "length": 4635,
        "width": 2014,
        "height": 1182,
        "weight": 3000
      }
    ],
    "GTS": [
      {
        "years": "2024-2026",
        "length": 4683,
        "width": 2045,
        "height": 1213,
        "weight": 3000
      }
    ],
    "Senna": [
      {
        "years": "2018-2023",
        "length": 4744,
        "width": 1958,
        "height": 1195,
        "weight": 3000
      }
    ],
    "Speedtail": [
      {
        "years": "2020-2023",
        "length": 5137,
        "width": 1997,
        "height": 1120,
        "weight": 3000
      }
    ],
    "Mp4-12c": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ]
  },
  "Mini": {
    "Cooper (3 puertas)": [
      {
        "gen": "R50/R53",
        "years": "2001-2006",
        "length": 3627,
        "width": 1689,
        "height": 1407,
        "weight": 1896
      },
      {
        "gen": "R56",
        "years": "2007-2013",
        "length": 3714,
        "width": 1684,
        "height": 1407,
        "weight": 1936
      },
      {
        "gen": "F56",
        "years": "2014-2023",
        "length": 3821,
        "width": 1727,
        "height": 1414,
        "weight": 2053
      },
      {
        "gen": "J01/F66",
        "years": "2024-2026",
        "length": 3876,
        "width": 1744,
        "height": 1432,
        "weight": 2130
      }
    ],
    "Cooper (5 puertas)": [
      {
        "gen": "F55",
        "years": "2015-2023",
        "length": 3982,
        "width": 1727,
        "height": 1425,
        "weight": 2156
      },
      {
        "gen": "F65",
        "years": "2024-2026",
        "length": 4036,
        "width": 1744,
        "height": 1464,
        "weight": 2576
      }
    ],
    "Cooper SE (Electric)": [
      {
        "gen": "F56 BEV",
        "years": "2020-2023",
        "length": 3850,
        "width": 1727,
        "height": 1432,
        "weight": 2095
      },
      {
        "gen": "J01 SE",
        "years": "2024-2026",
        "length": 3858,
        "width": 1756,
        "height": 1460,
        "weight": 2176
      }
    ],
    "Aceman (Electric Crossover)": [
      {
        "gen": "J05",
        "years": "2024-2026",
        "length": 4076,
        "width": 1754,
        "height": 1515,
        "weight": 2708
      }
    ],
    "Countryman": [
      {
        "gen": "R60",
        "years": "2010-2016",
        "length": 4097,
        "width": 1789,
        "height": 1561,
        "weight": 2860
      },
      {
        "gen": "F60",
        "years": "2017-2023",
        "length": 4299,
        "width": 1822,
        "height": 1557,
        "weight": 3000
      },
      {
        "gen": "U25",
        "years": "2024-2026",
        "length": 4444,
        "width": 1843,
        "height": 1661,
        "weight": 3000
      }
    ],
    "Paceman (Coupe SUV)": [
      {
        "gen": "R61",
        "years": "2013-2016",
        "length": 4109,
        "width": 1786,
        "height": 1518,
        "weight": 2785
      }
    ],
    "Clubman": [
      {
        "gen": "R55",
        "years": "2008-2014",
        "length": 3945,
        "width": 1684,
        "height": 1425,
        "weight": 2083
      },
      {
        "gen": "F54",
        "years": "2015-2024",
        "length": 4253,
        "width": 1800,
        "height": 1441,
        "weight": 2758
      }
    ],
    "Convertible (Cabrio)": [
      {
        "gen": "R52",
        "years": "2005-2008",
        "length": 3635,
        "width": 1689,
        "height": 1415,
        "weight": 1911
      },
      {
        "gen": "R57",
        "years": "2009-2015",
        "length": 3724,
        "width": 1684,
        "height": 1415,
        "weight": 1952
      },
      {
        "gen": "F57",
        "years": "2016-2024",
        "length": 3876,
        "width": 1727,
        "height": 1415,
        "weight": 2084
      },
      {
        "gen": "F67",
        "years": "2025-2026",
        "length": 3879,
        "width": 1744,
        "height": 1432,
        "weight": 2131
      }
    ],
    "Coupe (R58)": [
      {
        "gen": "R58",
        "years": "2011-2015",
        "length": 3728,
        "width": 1683,
        "height": 1378,
        "weight": 1902
      }
    ],
    "Roadster (R59)": [
      {
        "gen": "R59",
        "years": "2012-2015",
        "length": 3734,
        "width": 1683,
        "height": 1390,
        "weight": 1922
      }
    ],
    "John Cooper Works (JCW)": [
      {
        "model": "Hatch 3D",
        "years": "2015-2024",
        "length": 3872,
        "width": 1727,
        "height": 1414,
        "weight": 2080
      },
      {
        "model": "Countryman JCW",
        "years": "2024-2026",
        "length": 4447,
        "width": 1843,
        "height": 1645,
        "weight": 3000
      }
    ],
    "Cooper": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Hardtop": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Cooper Coupe": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Paceman": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Mini Monsoon": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ]
  },
  "Seat": {
    "Mii": [
      {
        "years": "2011-2021",
        "length": 3557,
        "width": 1641,
        "height": 1478,
        "weight": 1898
      }
    ],
    "Ibiza": [
      {
        "years": "2002-2026",
        "length": 4059,
        "width": 1780,
        "height": 1444,
        "weight": 2608
      }
    ],
    "Arona": [
      {
        "years": "2017-2026",
        "length": 4138,
        "width": 1780,
        "height": 1552,
        "weight": 2858
      }
    ],
    "Toledo": [
      {
        "years": "2004-2009",
        "length": 4458,
        "width": 1768,
        "height": 1568,
        "weight": 3000
      },
      {
        "years": "2012-2019",
        "length": 4482,
        "width": 1706,
        "height": 1461,
        "weight": 2793
      }
    ],
    "Leon": [
      {
        "years": "2005-2012",
        "length": 4315,
        "width": 1768,
        "height": 1455,
        "weight": 2775
      },
      {
        "years": "2013-2026",
        "length": 4368,
        "width": 1800,
        "height": 1456,
        "weight": 2862
      }
    ],
    "Altea": [
      {
        "years": "2004-2015",
        "length": 4280,
        "width": 1770,
        "height": 1570,
        "weight": 2973
      }
    ],
    "Ateca": [
      {
        "years": "2016-2026",
        "length": 4381,
        "width": 1841,
        "height": 1615,
        "weight": 3000
      }
    ],
    "Exeo": [
      {
        "years": "2008-2013",
        "length": 4661,
        "width": 1772,
        "height": 1430,
        "weight": 3000
      }
    ],
    "Tarraco": [
      {
        "years": "2018-2026",
        "length": 4735,
        "width": 1839,
        "height": 1658,
        "weight": 3000
      }
    ],
    "Alhambra": [
      {
        "years": "2010-2020",
        "length": 4854,
        "width": 1904,
        "height": 1720,
        "weight": 3000
      }
    ]
  },
  "Fiat": {
    "500": [
      {
        "years": "2007-2026",
        "length": 3546,
        "width": 1627,
        "height": 1488,
        "weight": 1889
      }
    ],
    "600": [
      {
        "years": "2023-2026",
        "length": 4171,
        "width": 1781,
        "height": 1523,
        "weight": 2828
      }
    ],
    "Mobi": [
      {
        "years": "2016-2026",
        "length": 3566,
        "width": 1633,
        "height": 1500,
        "weight": 1922
      }
    ],
    "Panda": [
      {
        "years": "2011-2024",
        "length": 3653,
        "width": 1643,
        "height": 1551,
        "weight": 2048
      }
    ],
    "Uno": [
      {
        "years": "1983-2013",
        "length": 3692,
        "width": 1548,
        "height": 1445,
        "weight": 1817
      },
      {
        "years": "2010-2021",
        "length": 3811,
        "width": 1636,
        "height": 1480,
        "weight": 2030
      }
    ],
    "Palio": [
      {
        "years": "1996-2011",
        "length": 3735,
        "width": 1614,
        "height": 1440,
        "weight": 1910
      },
      {
        "years": "2012-2018",
        "length": 3875,
        "width": 1670,
        "height": 1504,
        "weight": 2141
      }
    ],
    "Argo": [
      {
        "years": "2017-2026",
        "length": 3998,
        "width": 1724,
        "height": 1501,
        "weight": 2276
      }
    ],
    "Punto": [
      {
        "years": "2005-2018",
        "length": 4065,
        "width": 1687,
        "height": 1490,
        "weight": 2554
      }
    ],
    "Pulse": [
      {
        "years": "2021-2026",
        "length": 4099,
        "width": 1774,
        "height": 1579,
        "weight": 2870
      }
    ],
    "Idea": [
      {
        "years": "2003-2016",
        "length": 3931,
        "width": 1698,
        "height": 1680,
        "weight": 2467
      }
    ],
    "Siena": [
      {
        "years": "1996-2016",
        "length": 4135,
        "width": 1614,
        "height": 1425,
        "weight": 2378
      }
    ],
    "Grand Siena": [
      {
        "years": "2012-2021",
        "length": 4355,
        "width": 1700,
        "height": 1507,
        "weight": 2789
      }
    ],
    "Cronos": [
      {
        "years": "2018-2026",
        "length": 4364,
        "width": 1726,
        "height": 1516,
        "weight": 2855
      }
    ],
    "Fiorino": [
      {
        "years": "1988-2013",
        "length": 3950,
        "width": 1620,
        "height": 1870,
        "weight": 2633
      },
      {
        "years": "2014-2026",
        "length": 4384,
        "width": 1643,
        "height": 1900,
        "weight": 3000
      }
    ],
    "Qubo": [
      {
        "years": "2008-2020",
        "length": 3959,
        "width": 1716,
        "height": 1735,
        "weight": 2593
      }
    ],
    "Fastback": [
      {
        "years": "2022-2026",
        "length": 4427,
        "width": 1774,
        "height": 1545,
        "weight": 3000
      }
    ],
    "Linea": [
      {
        "years": "2007-2018",
        "length": 4560,
        "width": 1730,
        "height": 1494,
        "weight": 3000
      }
    ],
    "Tipo": [
      {
        "years": "2015-2024",
        "length": 4532,
        "width": 1792,
        "height": 1497,
        "weight": 3000
      }
    ],
    "Strada": [
      {
        "years": "1996-2019",
        "length": 4409,
        "width": 1664,
        "height": 1590,
        "weight": 2916
      },
      {
        "years": "2020-2026",
        "length": 4474,
        "width": 1732,
        "height": 1608,
        "weight": 3000
      }
    ],
    "Toro": [
      {
        "years": "2016-2026",
        "length": 4945,
        "width": 1844,
        "height": 1740,
        "weight": 3000
      }
    ],
    "Fullback": [
      {
        "years": "2016-2019",
        "length": 5285,
        "width": 1815,
        "height": 1780,
        "weight": 3000
      }
    ],
    "Titano": [
      {
        "years": "2024-2026",
        "length": 5330,
        "width": 1930,
        "height": 1819,
        "weight": 3000
      }
    ],
    "Freemont": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "124 Spider": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Spider 2000": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "X 1/9": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Brava": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Ducato": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "500e": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ]
  },
  "Jaguar": {
    "E-Pace": [
      {
        "years": "2017-2026",
        "length": 4395,
        "width": 1984,
        "height": 1649,
        "weight": 3000
      }
    ],
    "I-Pace": [
      {
        "years": "2018-2026",
        "length": 4682,
        "width": 2011,
        "height": 1565,
        "weight": 3000
      }
    ],
    "F-Pace": [
      {
        "years": "2016-2026",
        "length": 4731,
        "width": 1936,
        "height": 1667,
        "weight": 3000
      },
      {
        "years": "2021-2026",
        "length": 4747,
        "width": 2071,
        "height": 1664,
        "weight": 3000
      }
    ],
    "F-Pace SVR": [
      {
        "years": "2019-2026",
        "length": 4762,
        "width": 2070,
        "height": 1670,
        "weight": 3000
      }
    ],
    "XE": [
      {
        "years": "2015-2024",
        "length": 4672,
        "width": 1850,
        "height": 1416,
        "weight": 3000
      }
    ],
    "X-Type": [
      {
        "years": "2001-2009",
        "length": 4674,
        "width": 1788,
        "height": 1392,
        "weight": 3000
      }
    ],
    "S-Type": [
      {
        "years": "1999-2008",
        "length": 4861,
        "width": 1819,
        "height": 1422,
        "weight": 3000
      }
    ],
    "XF": [
      {
        "years": "2008-2015",
        "length": 4961,
        "width": 1877,
        "height": 1460,
        "weight": 3000
      },
      {
        "years": "2016-2024",
        "length": 4962,
        "width": 1880,
        "height": 1457,
        "weight": 3000
      }
    ],
    "XF Sportbrake": [
      {
        "years": "2017-2024",
        "length": 4955,
        "width": 1880,
        "height": 1496,
        "weight": 3000
      }
    ],
    "XJ": [
      {
        "years": "1994-2003",
        "length": 5024,
        "width": 1798,
        "height": 1314,
        "weight": 3000
      },
      {
        "years": "2003-2009",
        "length": 5090,
        "width": 1860,
        "height": 1448,
        "weight": 3000
      },
      {
        "years": "2010-2019",
        "length": 5122,
        "width": 1894,
        "height": 1448,
        "weight": 3000
      }
    ],
    "XJ L": [
      {
        "years": "2010-2019",
        "length": 5252,
        "width": 1894,
        "height": 1448,
        "weight": 3000
      }
    ],
    "F-Type": [
      {
        "years": "2013-2024",
        "length": 4470,
        "width": 1923,
        "height": 1311,
        "weight": 2817
      }
    ],
    "XK": [
      {
        "years": "1996-2006",
        "length": 4760,
        "width": 1829,
        "height": 1295,
        "weight": 3000
      },
      {
        "years": "2007-2014",
        "length": 4791,
        "width": 1892,
        "height": 1322,
        "weight": 3000
      }
    ],
    "XJ-S": [
      {
        "years": "1975-1996",
        "length": 4764,
        "width": 1793,
        "height": 1254,
        "weight": 2999
      }
    ],
    "XJ220": [
      {
        "years": "1992-1994",
        "length": 4930,
        "width": 2000,
        "height": 1150,
        "weight": 3000
      }
    ],
    "Vanden Plas": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Black Jaguar": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ]
  },
  "Alfa Romeo": {
    "147": [
      {
        "years": "2000-2010",
        "length": 4224,
        "width": 1730,
        "height": 1443,
        "weight": 2636
      }
    ],
    "156": [
      {
        "years": "1997-2005",
        "length": 4430,
        "width": 1745,
        "height": 1415,
        "weight": 2735
      }
    ],
    "159": [
      {
        "years": "2005-2011",
        "length": 4660,
        "width": 1828,
        "height": 1417,
        "weight": 3000
      }
    ],
    "166": [
      {
        "years": "1998-2007",
        "length": 4720,
        "width": 1815,
        "height": 1416,
        "weight": 3000
      }
    ],
    "4C": [
      {
        "years": "2013-2020",
        "length": 3989,
        "width": 1864,
        "height": 1183,
        "weight": 1935
      }
    ],
    "SZ": [
      {
        "years": "1989-1991",
        "length": 4060,
        "width": 1730,
        "height": 1300,
        "weight": 2283
      }
    ],
    "Mito": [
      {
        "years": "2008-2018",
        "length": 4063,
        "width": 1720,
        "height": 1446,
        "weight": 2526
      }
    ],
    "Junior": [
      {
        "years": "2024-2026",
        "length": 4173,
        "width": 1781,
        "height": 1533,
        "weight": 2848
      }
    ],
    "GTV": [
      {
        "years": "1995-2005",
        "length": 4285,
        "width": 1781,
        "height": 1316,
        "weight": 2511
      }
    ],
    "Giulietta": [
      {
        "years": "2010-2020",
        "length": 4351,
        "width": 1798,
        "height": 1465,
        "weight": 2865
      }
    ],
    "Spider": [
      {
        "years": "1995-2006",
        "length": 4285,
        "width": 1781,
        "height": 1315,
        "weight": 2509
      },
      {
        "years": "2006-2010",
        "length": 4393,
        "width": 1830,
        "height": 1318,
        "weight": 2649
      }
    ],
    "Brera": [
      {
        "years": "2005-2010",
        "length": 4410,
        "width": 1830,
        "height": 1341,
        "weight": 2706
      }
    ],
    "GT": [
      {
        "years": "2003-2010",
        "length": 4489,
        "width": 1763,
        "height": 1362,
        "weight": 2695
      }
    ],
    "Tonale": [
      {
        "years": "2022-2026",
        "length": 4528,
        "width": 1841,
        "height": 1601,
        "weight": 3000
      }
    ],
    "Giulia": [
      {
        "years": "2016-2026",
        "length": 4643,
        "width": 1860,
        "height": 1436,
        "weight": 3000
      }
    ],
    "Stelvio": [
      {
        "years": "2017-2026",
        "length": 4702,
        "width": 1955,
        "height": 1681,
        "weight": 3000
      }
    ],
    "8C Competizione": [
      {
        "years": "2007-2010",
        "length": 4381,
        "width": 1892,
        "height": 1341,
        "weight": 2779
      }
    ],
    "8c Competizione Spider": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Giulia (952)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Milano": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ]
  },
  "Maserati": {
    "Spyder": [
      {
        "years": "1989-1995",
        "length": 4043,
        "width": 1714,
        "height": 1310,
        "weight": 2269
      },
      {
        "years": "2001-2007",
        "length": 4303,
        "width": 1822,
        "height": 1305,
        "weight": 2558
      }
    ],
    "3200 GT": [
      {
        "years": "1998-2002",
        "length": 4511,
        "width": 1822,
        "height": 1305,
        "weight": 3000
      }
    ],
    "Coupe": [
      {
        "years": "2002-2007",
        "length": 4523,
        "width": 1822,
        "height": 1305,
        "weight": 3000
      }
    ],
    "MC20": [
      {
        "years": "2020-2026",
        "length": 4669,
        "width": 1965,
        "height": 1221,
        "weight": 3000
      }
    ],
    "MC20 Cielo": [
      {
        "years": "2022-2026",
        "length": 4669,
        "width": 1965,
        "height": 1217,
        "weight": 3000
      }
    ],
    "Grecale": [
      {
        "years": "2022-2026",
        "length": 4846,
        "width": 1948,
        "height": 1670,
        "weight": 3000
      },
      {
        "years": "2023-2026",
        "length": 4859,
        "width": 1979,
        "height": 1659,
        "weight": 3000
      }
    ],
    "GranTurismo": [
      {
        "years": "2007-2019",
        "length": 4881,
        "width": 1915,
        "height": 1353,
        "weight": 3000
      },
      {
        "years": "2023-2026",
        "length": 4959,
        "width": 1957,
        "height": 1353,
        "weight": 3000
      }
    ],
    "GranCabrio": [
      {
        "years": "2010-2019",
        "length": 4881,
        "width": 1915,
        "height": 1380,
        "weight": 3000
      },
      {
        "years": "2024-2026",
        "length": 4966,
        "width": 1957,
        "height": 1365,
        "weight": 3000
      }
    ],
    "Ghibli": [
      {
        "years": "1992-1998",
        "length": 4223,
        "width": 1775,
        "height": 1300,
        "weight": 2436
      },
      {
        "years": "2013-2024",
        "length": 4971,
        "width": 1945,
        "height": 1461,
        "weight": 3000
      }
    ],
    "Levante": [
      {
        "years": "2016-2026",
        "length": 5003,
        "width": 1968,
        "height": 1679,
        "weight": 3000
      },
      {
        "years": "2018-2026",
        "length": 5020,
        "width": 1981,
        "height": 1698,
        "weight": 3000
      }
    ],
    "Quattroporte": [
      {
        "years": "1994-2001",
        "length": 4550,
        "width": 1810,
        "height": 1380,
        "weight": 3000
      },
      {
        "years": "2003-2012",
        "length": 5052,
        "width": 1895,
        "height": 1438,
        "weight": 3000
      },
      {
        "years": "2013-2024",
        "length": 5262,
        "width": 1948,
        "height": 1481,
        "weight": 3000
      }
    ],
    "MC12": [
      {
        "years": "2004-2005",
        "length": 5143,
        "width": 2096,
        "height": 1205,
        "weight": 3000
      }
    ],
    "Merak": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Biturbo": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ]
  },
  "Aston Martin": {
    "Cygnet": [
      {
        "years": "2011-2013",
        "length": 3078,
        "width": 1680,
        "height": 1500,
        "weight": 1706
      }
    ],
    "V8 Vantage": [
      {
        "years": "1993-2000",
        "length": 4745,
        "width": 1944,
        "height": 1330,
        "weight": 3000
      },
      {
        "years": "2005-2017",
        "length": 4380,
        "width": 1865,
        "height": 1255,
        "weight": 2563
      }
    ],
    "V12 Vantage": [
      {
        "years": "2009-2018",
        "length": 4385,
        "width": 1865,
        "height": 1250,
        "weight": 2556
      },
      {
        "years": "2022-2024",
        "length": 4514,
        "width": 1962,
        "height": 1274,
        "weight": 3000
      }
    ],
    "Vantage": [
      {
        "years": "2018-2023",
        "length": 4465,
        "width": 1942,
        "height": 1273,
        "weight": 2760
      },
      {
        "years": "2024-2026",
        "length": 4495,
        "width": 2045,
        "height": 1275,
        "weight": 2930
      }
    ],
    "Valkyrie": [
      {
        "years": "2021-2026",
        "length": 4506,
        "width": 1975,
        "height": 1070,
        "weight": 2666
      }
    ],
    "Valhalla": [
      {
        "years": "2024-2026",
        "length": 4550,
        "width": 1950,
        "height": 1150,
        "weight": 2857
      }
    ],
    "One-77": [
      {
        "years": "2009-2012",
        "length": 4601,
        "width": 2204,
        "height": 1222,
        "weight": 3000
      }
    ],
    "DBS": [
      {
        "years": "2007-2012",
        "length": 4721,
        "width": 1905,
        "height": 1280,
        "weight": 3000
      }
    ],
    "DBS Superleggera": [
      {
        "years": "2018-2024",
        "length": 4712,
        "width": 1968,
        "height": 1280,
        "weight": 3000
      }
    ],
    "DB7": [
      {
        "years": "1994-2004",
        "length": 4646,
        "width": 1830,
        "height": 1270,
        "weight": 3000
      }
    ],
    "DB9": [
      {
        "years": "2004-2016",
        "length": 4710,
        "width": 1875,
        "height": 1270,
        "weight": 3000
      }
    ],
    "Virage": [
      {
        "years": "2011-2012",
        "length": 4703,
        "width": 1904,
        "height": 1282,
        "weight": 3000
      }
    ],
    "DB11": [
      {
        "years": "2016-2023",
        "length": 4739,
        "width": 1940,
        "height": 1279,
        "weight": 3000
      }
    ],
    "DB12": [
      {
        "years": "2023-2026",
        "length": 4725,
        "width": 1980,
        "height": 1295,
        "weight": 3000
      }
    ],
    "Vanquish": [
      {
        "years": "2001-2007",
        "length": 4665,
        "width": 1923,
        "height": 1318,
        "weight": 3000
      },
      {
        "years": "2012-2018",
        "length": 4720,
        "width": 1910,
        "height": 1294,
        "weight": 3000
      },
      {
        "years": "2024-2026",
        "length": 4850,
        "width": 1980,
        "height": 1290,
        "weight": 3000
      }
    ],
    "Rapide": [
      {
        "years": "2010-2020",
        "length": 5020,
        "width": 1929,
        "height": 1350,
        "weight": 3000
      }
    ],
    "DBX": [
      {
        "years": "2020-2026",
        "length": 5039,
        "width": 1998,
        "height": 1680,
        "weight": 3000
      }
    ],
    "Lagonda Taraf": [
      {
        "years": "2015-2016",
        "length": 5396,
        "width": 1917,
        "height": 1389,
        "weight": 3000
      }
    ],
    "Lagonda": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Vanquish Zagato": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Valour": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Valiant": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ]
  },
  "Ford": {
    "Festiva": [
      {
        "years": "1986-2002",
        "length": 3570,
        "width": 1605,
        "height": 1450,
        "weight": 1828
      }
    ],
    "KA": [
      {
        "years": "1997-2008",
        "length": 3620,
        "width": 1639,
        "height": 1411,
        "weight": 1842
      },
      {
        "years": "2015-2021",
        "length": 3886,
        "width": 1695,
        "height": 1525,
        "weight": 2210
      }
    ],
    "Fiesta Hatchback": [
      {
        "years": "2002-2008",
        "length": 3916,
        "width": 1683,
        "height": 1430,
        "weight": 2073
      },
      {
        "years": "2011-2019",
        "length": 4067,
        "width": 1722,
        "height": 1473,
        "weight": 2579
      }
    ],
    "Figo Hatchback": [
      {
        "years": "2015-2021",
        "length": 3886,
        "width": 1695,
        "height": 1525,
        "weight": 2210
      }
    ],
    "Ikon": [
      {
        "years": "2000-2007",
        "length": 4140,
        "width": 1634,
        "height": 1417,
        "weight": 2396
      }
    ],
    "Focus Hatchback": [
      {
        "years": "1998-2004",
        "length": 4175,
        "width": 1700,
        "height": 1440,
        "weight": 2555
      },
      {
        "years": "2011-2018",
        "length": 4358,
        "width": 1823,
        "height": 1484,
        "weight": 2947
      },
      {
        "years": "2019-2024",
        "length": 4378,
        "width": 1825,
        "height": 1454,
        "weight": 2904
      }
    ],
    "Puma": [
      {
        "years": "2019-2026",
        "length": 4186,
        "width": 1805,
        "height": 1537,
        "weight": 2903
      }
    ],
    "Figo Sedán": [
      {
        "years": "2015-2021",
        "length": 4254,
        "width": 1695,
        "height": 1525,
        "weight": 2749
      }
    ],
    "EcoSport": [
      {
        "years": "2003-2012",
        "length": 4240,
        "width": 1734,
        "height": 1629,
        "weight": 2994
      },
      {
        "years": "2013-2022",
        "length": 4269,
        "width": 1765,
        "height": 1653,
        "weight": 3000
      }
    ],
    "Laser": [
      {
        "years": "1994-2002",
        "length": 4340,
        "width": 1695,
        "height": 1420,
        "weight": 2611
      }
    ],
    "Bronco Sport": [
      {
        "years": "2021-2026",
        "length": 4387,
        "width": 1887,
        "height": 1783,
        "weight": 3000
      }
    ],
    "Fiesta Sedán": [
      {
        "years": "2011-2019",
        "length": 4409,
        "width": 1722,
        "height": 1473,
        "weight": 2796
      }
    ],
    "Transit Connect": [
      {
        "years": "2013-2023",
        "length": 4417,
        "width": 1834,
        "height": 1844,
        "weight": 3000
      }
    ],
    "Courier": [
      {
        "years": "1998-2013",
        "length": 4457,
        "width": 1770,
        "height": 1477,
        "weight": 2913
      }
    ],
    "Escape": [
      {
        "years": "2001-2007",
        "length": 4394,
        "width": 1781,
        "height": 1755,
        "weight": 3000
      },
      {
        "years": "2008-2012",
        "length": 4437,
        "width": 1806,
        "height": 1720,
        "weight": 3000
      },
      {
        "years": "2013-2019",
        "length": 4524,
        "width": 1839,
        "height": 1684,
        "weight": 3000
      },
      {
        "years": "2020-2026",
        "length": 4585,
        "width": 1882,
        "height": 1679,
        "weight": 3000
      }
    ],
    "Territory": [
      {
        "years": "2021-2026",
        "length": 4630,
        "width": 1935,
        "height": 1706,
        "weight": 3000
      }
    ],
    "Mustang": [
      {
        "years": "1994-2004",
        "length": 4610,
        "width": 1857,
        "height": 1344,
        "weight": 3000
      },
      {
        "years": "2005-2014",
        "length": 4775,
        "width": 1877,
        "height": 1407,
        "weight": 3000
      },
      {
        "years": "2015-2023",
        "length": 4788,
        "width": 1915,
        "height": 1379,
        "weight": 3000
      },
      {
        "years": "2024-2026",
        "length": 4811,
        "width": 1915,
        "height": 1397,
        "weight": 3000
      }
    ],
    "Edge": [
      {
        "years": "2007-2014",
        "length": 4717,
        "width": 1925,
        "height": 1702,
        "weight": 3000
      },
      {
        "years": "2015-2024",
        "length": 4778,
        "width": 1928,
        "height": 1742,
        "weight": 3000
      }
    ],
    "Mustang Mach-E": [
      {
        "years": "2021-2026",
        "length": 4713,
        "width": 1881,
        "height": 1597,
        "weight": 3000
      }
    ],
    "Bronco (4 puertas)": [
      {
        "years": "2021-2026",
        "length": 4811,
        "width": 1928,
        "height": 1852,
        "weight": 3000
      }
    ],
    "Fusion": [
      {
        "years": "2006-2012",
        "length": 4831,
        "width": 1834,
        "height": 1453,
        "weight": 3000
      },
      {
        "years": "2013-2020",
        "length": 4872,
        "width": 1852,
        "height": 1478,
        "weight": 3000
      }
    ],
    "Mondeo": [
      {
        "years": "2014-2022",
        "length": 4871,
        "width": 1852,
        "height": 1482,
        "weight": 3000
      }
    ],
    "Everest": [
      {
        "years": "2022-2026",
        "length": 4914,
        "width": 1923,
        "height": 1841,
        "weight": 3000
      }
    ],
    "Explorer": [
      {
        "years": "1995-2001",
        "length": 4788,
        "width": 1783,
        "height": 1702,
        "weight": 3000
      },
      {
        "years": "2002-2010",
        "length": 4813,
        "width": 1831,
        "height": 1826,
        "weight": 3000
      },
      {
        "years": "2011-2019",
        "length": 5006,
        "width": 2004,
        "height": 1788,
        "weight": 3000
      },
      {
        "years": "2020-2026",
        "length": 5049,
        "width": 2004,
        "height": 1775,
        "weight": 3000
      }
    ],
    "Maverick": [
      {
        "years": "2022-2026",
        "length": 5072,
        "width": 1844,
        "height": 1745,
        "weight": 3000
      }
    ],
    "Flex": [
      {
        "years": "2009-2019",
        "length": 5126,
        "width": 1928,
        "height": 1727,
        "weight": 3000
      }
    ],
    "Taurus": [
      {
        "years": "1996-2007",
        "length": 5016,
        "width": 1854,
        "height": 1400,
        "weight": 3000
      },
      {
        "years": "2010-2019",
        "length": 5154,
        "width": 1935,
        "height": 1542,
        "weight": 3000
      }
    ],
    "Ranger": [
      {
        "years": "1998-2011",
        "length": 5130,
        "width": 1786,
        "height": 1763,
        "weight": 3000
      },
      {
        "years": "2012-2022",
        "length": 5359,
        "width": 1850,
        "height": 1815,
        "weight": 3000
      },
      {
        "years": "2023-2026",
        "length": 5370,
        "width": 1918,
        "height": 1884,
        "weight": 3000
      }
    ],
    "Expedition": [
      {
        "years": "2003-2017",
        "length": 5245,
        "width": 2000,
        "height": 1961,
        "weight": 3000
      },
      {
        "years": "2018-2026",
        "length": 5334,
        "width": 2029,
        "height": 1941,
        "weight": 3000
      }
    ],
    "Crown Victoria": [
      {
        "years": "1992-2011",
        "length": 5385,
        "width": 1963,
        "height": 1443,
        "weight": 3000
      }
    ],
    "Econoline (Standard)": [
      {
        "years": "1992-2014",
        "length": 5382,
        "width": 2014,
        "height": 2050,
        "weight": 3000
      }
    ],
    "Expedition MAX": [
      {
        "years": "2018-2026",
        "length": 5636,
        "width": 2029,
        "height": 1938,
        "weight": 3000
      }
    ],
    "Excursion": [
      {
        "years": "2000-2005",
        "length": 5758,
        "width": 2032,
        "height": 1961,
        "weight": 3000
      }
    ],
    "F-150 SuperCrew": [
      {
        "years": "2015-2020",
        "length": 5890,
        "width": 2029,
        "height": 1961,
        "weight": 3000
      },
      {
        "years": "2021-2026",
        "length": 5885,
        "width": 2030,
        "height": 1960,
        "weight": 3000
      }
    ],
    "Econoline (Extended)": [
      {
        "years": "1992-2014",
        "length": 5893,
        "width": 2014,
        "height": 2050,
        "weight": 3000
      }
    ],
    "F-250 Super Duty": [
      {
        "years": "2017-2026",
        "length": 6350,
        "width": 2032,
        "height": 2070,
        "weight": 3000
      }
    ],
    "F-350 / F-450 Dually": [
      {
        "years": "2017-2026",
        "length": 6761,
        "width": 2438,
        "height": 2057,
        "weight": 3000
      }
    ],
    "Focus": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "E-150": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "F-150": [
      {
        "years": "2000-2026",
        "length": 5300,
        "width": 1900,
        "height": 1800,
        "weight": 3000
      }
    ],
    "F-250": [
      {
        "years": "2000-2026",
        "length": 5300,
        "width": 1900,
        "height": 1800,
        "weight": 3000
      }
    ],
    "F-350": [
      {
        "years": "2000-2026",
        "length": 5300,
        "width": 1900,
        "height": 1800,
        "weight": 3000
      }
    ],
    "F-450": [
      {
        "years": "2000-2026",
        "length": 5300,
        "width": 1900,
        "height": 1800,
        "weight": 3000
      }
    ],
    "F-550": [
      {
        "years": "2000-2026",
        "length": 5300,
        "width": 1900,
        "height": 1800,
        "weight": 3000
      }
    ],
    "E-250": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "E-350": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "E-450": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Thunderbird": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Five Hundred": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Taurus X": [
      {
        "years": "2000-2026",
        "length": 5100,
        "width": 1900,
        "height": 1450,
        "weight": 3000
      }
    ],
    "C-max": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Affordable Aluminum": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "E-550": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Aspire": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Probe": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Contour": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Bronco": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "F-150 Heritage": [
      {
        "years": "2000-2026",
        "length": 5300,
        "width": 1900,
        "height": 1800,
        "weight": 3000
      }
    ],
    "F-super Duty": [
      {
        "years": "2000-2026",
        "length": 5300,
        "width": 1900,
        "height": 1800,
        "weight": 3000
      }
    ],
    "Tempo": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "F-590": [
      {
        "years": "2000-2026",
        "length": 5300,
        "width": 1900,
        "height": 1800,
        "weight": 3000
      }
    ],
    "Bronco Ii": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Fairmont": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Granada": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "'34": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "1500 Foldaway": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "E-100": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "F-100": [
      {
        "years": "2000-2026",
        "length": 5300,
        "width": 1900,
        "height": 1800,
        "weight": 3000
      }
    ],
    "Malibu Sedan": [
      {
        "years": "2000-2026",
        "length": 4800,
        "width": 1820,
        "height": 1420,
        "weight": 3000
      }
    ],
    "Cordova Sedan": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Classic Sedan": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Expedition El": [
      {
        "years": "2000-2026",
        "length": 5200,
        "width": 1950,
        "height": 1850,
        "weight": 3000
      }
    ]
  },
  "Chevrolet": {
    "Spark": [
      {
        "years": "2010-2017",
        "length": 3640,
        "width": 1597,
        "height": 1522,
        "weight": 1946
      },
      {
        "years": "2018-2022",
        "length": 3636,
        "width": 1595,
        "height": 1483,
        "weight": 1892
      }
    ],
    "Beat": [
      {
        "years": "2018-2021",
        "length": 3635,
        "width": 1597,
        "height": 1522,
        "weight": 1944
      }
    ],
    "Corsa": [
      {
        "years": "2002-2009",
        "length": 3822,
        "width": 1646,
        "height": 1432,
        "weight": 1982
      }
    ],
    "Sonic Hatchback": [
      {
        "years": "2012-2020",
        "length": 4039,
        "width": 1735,
        "height": 1517,
        "weight": 2658
      }
    ],
    "Onix Hatchback": [
      {
        "years": "2019-2026",
        "length": 4160,
        "width": 1730,
        "height": 1471,
        "weight": 2647
      }
    ],
    "Bolt EV": [
      {
        "years": "2017-2023",
        "length": 4166,
        "width": 1765,
        "height": 1595,
        "weight": 2932
      }
    ],
    "Aveo Hatchback": [
      {
        "years": "2024-2026",
        "length": 4171,
        "width": 1700,
        "height": 1490,
        "weight": 2641
      }
    ],
    "Groove": [
      {
        "years": "2021-2026",
        "length": 4220,
        "width": 1740,
        "height": 1615,
        "weight": 2965
      }
    ],
    "Tracker": [
      {
        "years": "2013-2019",
        "length": 4248,
        "width": 1775,
        "height": 1674,
        "weight": 3000
      },
      {
        "years": "2020-2026",
        "length": 4270,
        "width": 1791,
        "height": 1627,
        "weight": 3000
      }
    ],
    "Bolt EUV": [
      {
        "years": "2022-2026",
        "length": 4305,
        "width": 1770,
        "height": 1616,
        "weight": 3000
      }
    ],
    "Aveo Sedán": [
      {
        "years": "2008-2017",
        "length": 4310,
        "width": 1710,
        "height": 1505,
        "weight": 2773
      },
      {
        "years": "2018-2023",
        "length": 4300,
        "width": 1735,
        "height": 1502,
        "weight": 2801
      }
    ],
    "Sonic Sedán": [
      {
        "years": "2012-2020",
        "length": 4399,
        "width": 1735,
        "height": 1517,
        "weight": 2895
      }
    ],
    "Trailblazer (Compacta)": [
      {
        "years": "2021-2026",
        "length": 4412,
        "width": 1808,
        "height": 1669,
        "weight": 3000
      }
    ],
    "N400": [
      {
        "years": "2020-2026",
        "length": 4425,
        "width": 1670,
        "height": 1860,
        "weight": 3000
      }
    ],
    "Onix Sedán": [
      {
        "years": "2019-2026",
        "length": 4474,
        "width": 1730,
        "height": 1471,
        "weight": 2846
      }
    ],
    "Sail": [
      {
        "years": "2024-2026",
        "length": 4490,
        "width": 1735,
        "height": 1490,
        "weight": 2902
      }
    ],
    "Optra": [
      {
        "years": "2004-2013",
        "length": 4500,
        "width": 1725,
        "height": 1445,
        "weight": 2804
      }
    ],
    "Trax": [
      {
        "years": "2024-2026",
        "length": 4537,
        "width": 1823,
        "height": 1560,
        "weight": 3000
      }
    ],
    "Cruze": [
      {
        "years": "2010-2015",
        "length": 4597,
        "width": 1788,
        "height": 1477,
        "weight": 3000
      },
      {
        "years": "2016-2023",
        "length": 4666,
        "width": 1791,
        "height": 1458,
        "weight": 3000
      }
    ],
    "Cavalier": [
      {
        "years": "2022-2026",
        "length": 4614,
        "width": 1798,
        "height": 1485,
        "weight": 3000
      }
    ],
    "Corvette": [
      {
        "years": "1997-2004",
        "length": 4564,
        "width": 1869,
        "height": 1212,
        "weight": 2895
      },
      {
        "years": "2005-2013",
        "length": 4435,
        "width": 1844,
        "height": 1245,
        "weight": 2545
      },
      {
        "years": "2014-2019",
        "length": 4493,
        "width": 1872,
        "height": 1240,
        "weight": 2607
      },
      {
        "years": "2020-2026",
        "length": 4630,
        "width": 1933,
        "height": 1234,
        "weight": 3000
      }
    ],
    "Equinox": [
      {
        "years": "2018-2024",
        "length": 4652,
        "width": 1843,
        "height": 1661,
        "weight": 3000
      },
      {
        "years": "2025-2026",
        "length": 4653,
        "width": 1902,
        "height": 1667,
        "weight": 3000
      }
    ],
    "Captiva": [
      {
        "years": "2019-2026",
        "length": 4655,
        "width": 1835,
        "height": 1760,
        "weight": 3000
      }
    ],
    "Montana": [
      {
        "years": "2023-2026",
        "length": 4720,
        "width": 1800,
        "height": 1660,
        "weight": 3000
      }
    ],
    "Camaro": [
      {
        "years": "2016-2024",
        "length": 4783,
        "width": 1897,
        "height": 1349,
        "weight": 3000
      }
    ],
    "Equinox EV": [
      {
        "years": "2024-2026",
        "length": 4836,
        "width": 1915,
        "height": 1613,
        "weight": 3000
      }
    ],
    "Blazer EV": [
      {
        "years": "2024-2026",
        "length": 4882,
        "width": 1981,
        "height": 1651,
        "weight": 3000
      }
    ],
    "Trailblazer (Grande)": [
      {
        "years": "2012-2024",
        "length": 4887,
        "width": 1902,
        "height": 1840,
        "weight": 3000
      }
    ],
    "Blazer": [
      {
        "years": "2019-2026",
        "length": 4917,
        "width": 1948,
        "height": 1702,
        "weight": 3000
      }
    ],
    "Malibu": [
      {
        "years": "2016-2025",
        "length": 4923,
        "width": 1854,
        "height": 1463,
        "weight": 3000
      }
    ],
    "Impala": [
      {
        "years": "2014-2020",
        "length": 5113,
        "width": 1854,
        "height": 1496,
        "weight": 3000
      }
    ],
    "Traverse": [
      {
        "years": "2018-2023",
        "length": 5189,
        "width": 1996,
        "height": 1795,
        "weight": 3000
      },
      {
        "years": "2024-2026",
        "length": 5194,
        "width": 2012,
        "height": 1776,
        "weight": 3000
      }
    ],
    "S10 Max": [
      {
        "years": "2022-2026",
        "length": 5365,
        "width": 1900,
        "height": 1809,
        "weight": 3000
      }
    ],
    "Colorado": [
      {
        "years": "2012-2022",
        "length": 5347,
        "width": 1882,
        "height": 1817,
        "weight": 3000
      },
      {
        "years": "2023-2026",
        "length": 5411,
        "width": 1905,
        "height": 1818,
        "weight": 3000
      }
    ],
    "Tahoe": [
      {
        "years": "2015-2020",
        "length": 5182,
        "width": 2045,
        "height": 1890,
        "weight": 3000
      },
      {
        "years": "2021-2026",
        "length": 5352,
        "width": 2057,
        "height": 1925,
        "weight": 3000
      }
    ],
    "Avalanche": [
      {
        "years": "2007-2013",
        "length": 5621,
        "width": 2009,
        "height": 1836,
        "weight": 3000
      }
    ],
    "Suburban": [
      {
        "years": "2015-2020",
        "length": 5700,
        "width": 2045,
        "height": 1890,
        "weight": 3000
      },
      {
        "years": "2021-2026",
        "length": 5733,
        "width": 2057,
        "height": 1923,
        "weight": 3000
      }
    ],
    "Silverado 1500": [
      {
        "years": "2019-2026",
        "length": 5885,
        "width": 2063,
        "height": 1990,
        "weight": 3000
      }
    ],
    "Express Van": [
      {
        "years": "2003-2026",
        "length": 6200,
        "width": 2012,
        "height": 2130,
        "weight": 3000
      }
    ],
    "Silverado 2500HD": [
      {
        "years": "2020-2026",
        "length": 6351,
        "width": 2079,
        "height": 2030,
        "weight": 3000
      }
    ],
    "Silverado 3500HD (Doble Rodaje)": [
      {
        "years": "2020-2026",
        "length": 6754,
        "width": 2459,
        "height": 2047,
        "weight": 3000
      }
    ],
    "Aveo": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Caprice Police Vehicle": [
      {
        "years": "2000-2026",
        "length": 5100,
        "width": 1900,
        "height": 1450,
        "weight": 3000
      }
    ],
    "Sonic": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Volt": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Express": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Orlando": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Silverado": [
      {
        "years": "2000-2026",
        "length": 5300,
        "width": 1900,
        "height": 1800,
        "weight": 3000
      }
    ],
    "City Express": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Geo Prizm": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Matiz": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Cobalt": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Kalos": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Trailblazer": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Uplander": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Monte Carlo": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Epica": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Venture": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Lumina": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Alero": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Caprice": [
      {
        "years": "2000-2026",
        "length": 5100,
        "width": 1900,
        "height": 1450,
        "weight": 3000
      }
    ],
    "Beretta": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Metro": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Gmt-400": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Military Truck": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "S-10 Pickup": [
      {
        "years": "2000-2026",
        "length": 5300,
        "width": 1900,
        "height": 1800,
        "weight": 3000
      }
    ],
    "C/k Pickup": [
      {
        "years": "2000-2026",
        "length": 5300,
        "width": 1900,
        "height": 1800,
        "weight": 3000
      }
    ],
    "Lumina Apv": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Impala Limited": [
      {
        "years": "2000-2026",
        "length": 5100,
        "width": 1900,
        "height": 1450,
        "weight": 3000
      }
    ],
    "S-10 Blazer": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Celebrity": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Geo Spectrum": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Chevette": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Hi-cube": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Geo Sprint": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Nova": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Citation": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Aluminum Tilt": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "El Camino": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Malibu Classic": [
      {
        "years": "2000-2026",
        "length": 4800,
        "width": 1820,
        "height": 1420,
        "weight": 3000
      }
    ],
    "Silverado Hd": [
      {
        "years": "2000-2026",
        "length": 5300,
        "width": 1900,
        "height": 1800,
        "weight": 3000
      }
    ],
    "Silverado Ld": [
      {
        "years": "2000-2026",
        "length": 5300,
        "width": 1900,
        "height": 1800,
        "weight": 3000
      }
    ],
    "W3500/w4500": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "W5500/w5500 Hd": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Onix": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Cruze Limited": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Malibu Limited": [
      {
        "years": "2000-2026",
        "length": 4800,
        "width": 1820,
        "height": 1420,
        "weight": 3000
      }
    ],
    "Suburban Hd": [
      {
        "years": "2000-2026",
        "length": 5200,
        "width": 1950,
        "height": 1850,
        "weight": 3000
      }
    ],
    "Bolt": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ]
  },
  "Jeep": {
    "Wrangler (2 puertas)": [
      {
        "years": "1987-1995",
        "length": 3880,
        "width": 1680,
        "height": 1750,
        "weight": 2510
      },
      {
        "years": "1997-2006",
        "length": 3880,
        "width": 1740,
        "height": 1748,
        "weight": 2596
      },
      {
        "years": "2007-2017",
        "length": 4223,
        "width": 1873,
        "height": 1800,
        "weight": 3000
      },
      {
        "years": "2018-2026",
        "length": 4237,
        "width": 1875,
        "height": 1868,
        "weight": 3000
      }
    ],
    "Avenger": [
      {
        "years": "2023-2026",
        "length": 4084,
        "width": 1776,
        "height": 1528,
        "weight": 2771
      }
    ],
    "Renegade": [
      {
        "years": "2015-2026",
        "length": 4232,
        "width": 1803,
        "height": 1689,
        "weight": 3000
      }
    ],
    "Wrangler Unlimited (4 puertas)": [
      {
        "years": "2007-2017",
        "length": 4751,
        "width": 1877,
        "height": 1800,
        "weight": 3000
      },
      {
        "years": "2018-2026",
        "length": 4785,
        "width": 1875,
        "height": 1868,
        "weight": 3000
      }
    ],
    "Compass": [
      {
        "years": "2007-2016",
        "length": 4405,
        "width": 1760,
        "height": 1630,
        "weight": 3000
      },
      {
        "years": "2017-2026",
        "length": 4394,
        "width": 1819,
        "height": 1635,
        "weight": 3000
      }
    ],
    "Patriot": [
      {
        "years": "2007-2017",
        "length": 4410,
        "width": 1755,
        "height": 1635,
        "weight": 3000
      }
    ],
    "Liberty": [
      {
        "years": "2002-2007",
        "length": 4437,
        "width": 1819,
        "height": 1796,
        "weight": 3000
      },
      {
        "years": "2008-2012",
        "length": 4493,
        "width": 1836,
        "height": 1793,
        "weight": 3000
      }
    ],
    "Cherokee": [
      {
        "years": "1984-2001",
        "length": 4240,
        "width": 1790,
        "height": 1620,
        "weight": 3000
      },
      {
        "years": "2014-2023",
        "length": 4623,
        "width": 1859,
        "height": 1667,
        "weight": 3000
      }
    ],
    "Grand Cherokee": [
      {
        "years": "1993-1998",
        "length": 4500,
        "width": 1760,
        "height": 1710,
        "weight": 3000
      },
      {
        "years": "1999-2004",
        "length": 4610,
        "width": 1836,
        "height": 1763,
        "weight": 3000
      },
      {
        "years": "2005-2010",
        "length": 4740,
        "width": 1869,
        "height": 1720,
        "weight": 3000
      },
      {
        "years": "2011-2021",
        "length": 4821,
        "width": 1943,
        "height": 1760,
        "weight": 3000
      },
      {
        "years": "2022-2026",
        "length": 4915,
        "width": 1968,
        "height": 1798,
        "weight": 3000
      }
    ],
    "Commander": [
      {
        "years": "2006-2010",
        "length": 4788,
        "width": 1899,
        "height": 1826,
        "weight": 3000
      }
    ],
    "Grand Cherokee L (3 Filas)": [
      {
        "years": "2021-2026",
        "length": 5204,
        "width": 1963,
        "height": 1816,
        "weight": 3000
      }
    ],
    "Wagoneer": [
      {
        "years": "2022-2026",
        "length": 5453,
        "width": 2123,
        "height": 1920,
        "weight": 3000
      }
    ],
    "Grand Wagoneer": [
      {
        "years": "2022-2026",
        "length": 5453,
        "width": 2123,
        "height": 1920,
        "weight": 3000
      }
    ],
    "Gladiator": [
      {
        "years": "2020-2026",
        "length": 5537,
        "width": 1875,
        "height": 1857,
        "weight": 3000
      }
    ],
    "Wagoneer L": [
      {
        "years": "2023-2026",
        "length": 5758,
        "width": 2123,
        "height": 1920,
        "weight": 3000
      }
    ],
    "Grand Wagoneer L": [
      {
        "years": "2023-2026",
        "length": 5758,
        "width": 2123,
        "height": 1920,
        "weight": 3000
      }
    ],
    "Wrangler": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Comanche": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "J-10": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "J-20": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Cj-7": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Cj-8 Scrambler": [
      {
        "years": "2000-2026",
        "length": 5300,
        "width": 1900,
        "height": 1800,
        "weight": 3000
      }
    ],
    "Cj-5": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Cj-6": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Wrangler Jk": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Grand Cherokee L": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Wagoneer S": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Recon": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ]
  },
  "RAM": {
    "700": [
      {
        "years": "2014-2020",
        "length": 4471,
        "width": 1664,
        "height": 1590,
        "weight": 2957
      },
      {
        "years": "2021-2026",
        "length": 4474,
        "width": 1732,
        "height": 1595,
        "weight": 3000
      }
    ],
    "1000": [
      {
        "years": "2019-2026",
        "length": 4945,
        "width": 1844,
        "height": 1735,
        "weight": 3000
      }
    ],
    "1500 Cabina Cuádruple": [
      {
        "years": "2009-2018",
        "length": 5817,
        "width": 2017,
        "height": 1900,
        "weight": 3000
      },
      {
        "years": "2019-2026",
        "length": 5814,
        "width": 2084,
        "height": 1971,
        "weight": 3000
      }
    ],
    "1500 Cabina Crew (Batea Corta)": [
      {
        "years": "2009-2018",
        "length": 5817,
        "width": 2017,
        "height": 1900,
        "weight": 3000
      },
      {
        "years": "2019-2026",
        "length": 5916,
        "width": 2084,
        "height": 1971,
        "weight": 3000
      }
    ],
    "1500 Cabina Crew (Batea Larga)": [
      {
        "years": "2019-2026",
        "length": 6142,
        "width": 2084,
        "height": 1971,
        "weight": 3000
      }
    ],
    "1500 TRX": [
      {
        "years": "2021-2024",
        "length": 5916,
        "width": 2235,
        "height": 2055,
        "weight": 3000
      }
    ],
    "2500 Heavy Duty (Cabina Crew)": [
      {
        "years": "2010-2018",
        "length": 6030,
        "width": 2009,
        "height": 1974,
        "weight": 3000
      },
      {
        "years": "2019-2026",
        "length": 6066,
        "width": 2120,
        "height": 2037,
        "weight": 3000
      }
    ],
    "2500 Heavy Duty (Mega Cabina)": [
      {
        "years": "2010-2018",
        "length": 6300,
        "width": 2009,
        "height": 1980,
        "weight": 3000
      },
      {
        "years": "2019-2026",
        "length": 6348,
        "width": 2120,
        "height": 2037,
        "weight": 3000
      }
    ],
    "3500 Doble Rodaje (Cabina Crew)": [
      {
        "years": "2019-2026",
        "length": 6066,
        "width": 2438,
        "height": 2045,
        "weight": 3000
      }
    ],
    "3500 Doble Rodaje (Mega Cabina)": [
      {
        "years": "2019-2026",
        "length": 6348,
        "width": 2438,
        "height": 2045,
        "weight": 3000
      }
    ],
    "V700 City": [
      {
        "years": "2014-2021",
        "length": 3950,
        "width": 1716,
        "height": 1890,
        "weight": 2818
      }
    ],
    "V700 Rapid": [
      {
        "years": "2017-2026",
        "length": 4390,
        "width": 1709,
        "height": 1899,
        "weight": 3000
      }
    ],
    "ProMaster": [
      {
        "years": "2014-2026",
        "length": 5413,
        "width": 2050,
        "height": 2522,
        "weight": 3000
      }
    ],
    "Enduramax": [
      {
        "years": "2000-2026",
        "length": 5300,
        "width": 1900,
        "height": 1800,
        "weight": 3000
      }
    ],
    "Replica": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Cruiser": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Cargo Van": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Urban": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Touring": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Rambler": [
      {
        "years": "2000-2026",
        "length": 5300,
        "width": 1900,
        "height": 1800,
        "weight": 3000
      }
    ]
  },
  "Hummer": {
    "H1": [
      {
        "years": "1992-2006",
        "length": 4686,
        "width": 2197,
        "height": 1905,
        "weight": 3000
      }
    ],
    "H2": [
      {
        "years": "2003-2009",
        "length": 5171,
        "width": 2062,
        "height": 2012,
        "weight": 3000
      }
    ],
    "H2 SUT Pickup": [
      {
        "years": "2005-2009",
        "length": 5171,
        "width": 2062,
        "height": 2012,
        "weight": 3000
      }
    ],
    "H3": [
      {
        "years": "2005-2010",
        "length": 4778,
        "width": 1897,
        "height": 1872,
        "weight": 3000
      }
    ],
    "H3T Pickup": [
      {
        "years": "2009-2010",
        "length": 5403,
        "width": 1908,
        "height": 1831,
        "weight": 3000
      }
    ],
    "EV SUV": [
      {
        "years": "2024-2026",
        "length": 4999,
        "width": 2197,
        "height": 1918,
        "weight": 3000
      }
    ],
    "EV Pickup": [
      {
        "years": "2022-2026",
        "length": 5507,
        "width": 2202,
        "height": 2009,
        "weight": 3000
      }
    ],
    "HX": [
      {
        "years": "2008-2010",
        "length": 4343,
        "width": 2057,
        "height": 1829,
        "weight": 3000
      }
    ]
  },
  "Tesla": {
    "Model 2": [
      {
        "years": "2025-2026",
        "length": 4100,
        "width": 1800,
        "height": 1470,
        "weight": 2712
      }
    ],
    "Model 3": [
      {
        "years": "2017-2023",
        "length": 4694,
        "width": 1849,
        "height": 1443,
        "weight": 3000
      },
      {
        "years": "2024-2026",
        "length": 4720,
        "width": 1848,
        "height": 1441,
        "weight": 3000
      }
    ],
    "Model Y": [
      {
        "years": "2020-2026",
        "length": 4751,
        "width": 1921,
        "height": 1624,
        "weight": 3000
      }
    ],
    "Model S": [
      {
        "years": "2012-2020",
        "length": 4970,
        "width": 1964,
        "height": 1435,
        "weight": 3000
      },
      {
        "years": "2021-2026",
        "length": 4970,
        "width": 1964,
        "height": 1445,
        "weight": 3000
      }
    ],
    "Model X": [
      {
        "years": "2016-2026",
        "length": 5036,
        "width": 1999,
        "height": 1684,
        "weight": 3000
      }
    ],
    "Cybertruck": [
      {
        "years": "2024-2026",
        "length": 5682,
        "width": 2032,
        "height": 1791,
        "weight": 3000
      }
    ],
    "Roadster": [
      {
        "years": "2008-2012",
        "length": 3946,
        "width": 1873,
        "height": 1127,
        "weight": 1832
      },
      {
        "years": "2025-2026",
        "length": 4300,
        "width": 1880,
        "height": 1300,
        "weight": 2627
      }
    ]
  },
  "GMC": {
    "Terrain": [
      {
        "years": "2010-2017",
        "length": 4707,
        "width": 1849,
        "height": 1684,
        "weight": 3000
      },
      {
        "years": "2018-2024",
        "length": 4630,
        "width": 1839,
        "height": 1661,
        "weight": 3000
      },
      {
        "years": "2025-2026",
        "length": 4658,
        "width": 1905,
        "height": 1712,
        "weight": 3000
      }
    ],
    "Acadia": [
      {
        "years": "2007-2016",
        "length": 5108,
        "width": 2002,
        "height": 1775,
        "weight": 3000
      },
      {
        "years": "2017-2023",
        "length": 4912,
        "width": 1915,
        "height": 1676,
        "weight": 3000
      },
      {
        "years": "2024-2026",
        "length": 5179,
        "width": 2022,
        "height": 1826,
        "weight": 3000
      }
    ],
    "Envoy": [
      {
        "years": "2002-2009",
        "length": 4867,
        "width": 1897,
        "height": 1826,
        "weight": 3000
      }
    ],
    "Envoy XL": [
      {
        "years": "2002-2006",
        "length": 5278,
        "width": 1897,
        "height": 1910,
        "weight": 3000
      }
    ],
    "Yukon": [
      {
        "years": "2007-2014",
        "length": 5131,
        "width": 2007,
        "height": 1953,
        "weight": 3000
      },
      {
        "years": "2015-2020",
        "length": 5179,
        "width": 2045,
        "height": 1890,
        "weight": 3000
      },
      {
        "years": "2021-2026",
        "length": 5334,
        "width": 2057,
        "height": 1943,
        "weight": 3000
      }
    ],
    "Yukon XL": [
      {
        "years": "2007-2014",
        "length": 5644,
        "width": 2009,
        "height": 1951,
        "weight": 3000
      },
      {
        "years": "2015-2020",
        "length": 5697,
        "width": 2045,
        "height": 1890,
        "weight": 3000
      },
      {
        "years": "2021-2026",
        "length": 5720,
        "width": 2057,
        "height": 1943,
        "weight": 3000
      }
    ],
    "Canyon": [
      {
        "years": "2004-2012",
        "length": 4887,
        "width": 1717,
        "height": 1651,
        "weight": 3000
      },
      {
        "years": "2015-2022",
        "length": 5395,
        "width": 1887,
        "height": 1793,
        "weight": 3000
      },
      {
        "years": "2023-2026",
        "length": 5415,
        "width": 1905,
        "height": 2024,
        "weight": 3000
      }
    ],
    "Sierra 1500 Cabina Sencilla": [
      {
        "years": "2019-2026",
        "length": 5354,
        "width": 2063,
        "height": 1920,
        "weight": 3000
      }
    ],
    "Sierra 1500 Cabina Crew": [
      {
        "years": "2014-2018",
        "length": 5815,
        "width": 2032,
        "height": 1877,
        "weight": 3000
      },
      {
        "years": "2019-2026",
        "length": 5885,
        "width": 2063,
        "height": 1917,
        "weight": 3000
      }
    ],
    "Sierra 2500 Heavy Duty": [
      {
        "years": "2020-2026",
        "length": 6351,
        "width": 2079,
        "height": 2027,
        "weight": 3000
      }
    ],
    "Sierra 3500 Heavy Duty": [
      {
        "years": "2020-2026",
        "length": 6351,
        "width": 2079,
        "height": 2027,
        "weight": 3000
      }
    ],
    "Sierra 3500 Doble Rodaje": [
      {
        "years": "2020-2026",
        "length": 6754,
        "width": 2459,
        "height": 2047,
        "weight": 3000
      }
    ],
    "Savana Van": [
      {
        "years": "2003-2026",
        "length": 5692,
        "width": 2012,
        "height": 2073,
        "weight": 3000
      }
    ],
    "Savana Van Extendida": [
      {
        "years": "2003-2026",
        "length": 6200,
        "width": 2012,
        "height": 2130,
        "weight": 3000
      }
    ],
    "Savana": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Sierra": [
      {
        "years": "2000-2026",
        "length": 5300,
        "width": 1900,
        "height": 1800,
        "weight": 3000
      }
    ],
    "Safari": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Gmt-400": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Sonoma": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Suburban": [
      {
        "years": "2000-2026",
        "length": 5200,
        "width": 1950,
        "height": 1850,
        "weight": 3000
      }
    ],
    "C/k Pickup": [
      {
        "years": "2000-2026",
        "length": 5300,
        "width": 1900,
        "height": 1800,
        "weight": 3000
      }
    ],
    "Jimmy Utility": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "S15 Utility": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Vandura": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Rally": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Magna Van": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Typhoon": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Value Van": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Hi-cube": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Geo Tracker": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Jimmy": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "S15 Pickup": [
      {
        "years": "2000-2026",
        "length": 5300,
        "width": 1900,
        "height": 1800,
        "weight": 3000
      }
    ],
    "Aluminum Tilt": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Caballero": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Sierra Hd": [
      {
        "years": "2000-2026",
        "length": 5300,
        "width": 1900,
        "height": 1800,
        "weight": 3000
      }
    ],
    "Sierra Limited": [
      {
        "years": "2000-2026",
        "length": 5300,
        "width": 1900,
        "height": 1800,
        "weight": 3000
      }
    ],
    "W3500/w4500": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "W5500/w5500 Hd": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Hummer Ev Suv": [
      {
        "years": "2000-2026",
        "length": 5200,
        "width": 1950,
        "height": 1850,
        "weight": 3000
      }
    ],
    "Hummer Ev Pickup": [
      {
        "years": "2000-2026",
        "length": 5300,
        "width": 1900,
        "height": 1800,
        "weight": 3000
      }
    ]
  },
  "Cadillac": {
    "XT4": [
      {
        "years": "2019-2026",
        "length": 4595,
        "width": 1882,
        "height": 1605,
        "weight": 3000
      }
    ],
    "XT5": [
      {
        "years": "2017-2026",
        "length": 4816,
        "width": 1902,
        "height": 1676,
        "weight": 3000
      }
    ],
    "CT4": [
      {
        "years": "2020-2026",
        "length": 4755,
        "width": 1814,
        "height": 1422,
        "weight": 3000
      }
    ],
    "CT5": [
      {
        "years": "2020-2026",
        "length": 4923,
        "width": 1882,
        "height": 1453,
        "weight": 3000
      }
    ],
    "CTS": [
      {
        "years": "2003-2007",
        "length": 4829,
        "width": 1793,
        "height": 1440,
        "weight": 3000
      },
      {
        "years": "2008-2013",
        "length": 4859,
        "width": 1841,
        "height": 1473,
        "weight": 3000
      },
      {
        "years": "2014-2019",
        "length": 4966,
        "width": 1834,
        "height": 1453,
        "weight": 3000
      }
    ],
    "STS": [
      {
        "years": "2005-2011",
        "length": 4986,
        "width": 1844,
        "height": 1463,
        "weight": 3000
      }
    ],
    "Lyriq": [
      {
        "years": "2023-2026",
        "length": 4996,
        "width": 1976,
        "height": 1623,
        "weight": 3000
      }
    ],
    "XT6": [
      {
        "years": "2020-2026",
        "length": 5050,
        "width": 1963,
        "height": 1775,
        "weight": 3000
      }
    ],
    "DTS": [
      {
        "years": "2006-2011",
        "length": 5273,
        "width": 1895,
        "height": 1463,
        "weight": 3000
      }
    ],
    "Escalade": [
      {
        "years": "2002-2006",
        "length": 5052,
        "width": 2004,
        "height": 1897,
        "weight": 3000
      },
      {
        "years": "2007-2014",
        "length": 5144,
        "width": 2007,
        "height": 1887,
        "weight": 3000
      },
      {
        "years": "2015-2020",
        "length": 5179,
        "width": 2045,
        "height": 1890,
        "weight": 3000
      },
      {
        "years": "2021-2026",
        "length": 5382,
        "width": 2057,
        "height": 1948,
        "weight": 3000
      }
    ],
    "Escalade ESV": [
      {
        "years": "2007-2014",
        "length": 5662,
        "width": 2009,
        "height": 1895,
        "weight": 3000
      },
      {
        "years": "2015-2020",
        "length": 5697,
        "width": 2045,
        "height": 1890,
        "weight": 3000
      },
      {
        "years": "2021-2026",
        "length": 5766,
        "width": 2057,
        "height": 1941,
        "weight": 3000
      }
    ],
    "Escalade EXT Pickup": [
      {
        "years": "2002-2006",
        "length": 5624,
        "width": 2017,
        "height": 1895,
        "weight": 3000
      },
      {
        "years": "2007-2013",
        "length": 5639,
        "width": 2009,
        "height": 1887,
        "weight": 3000
      }
    ],
    "Deville": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Eldorado": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Catera": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Seville": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Fleetwood": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Armored Vehicle": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "60 Special": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Allante": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Brougham": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Cimarron": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Escalade Iq": [
      {
        "years": "2000-2026",
        "length": 5200,
        "width": 1950,
        "height": 1850,
        "weight": 3000
      }
    ],
    "Optiq": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Escalade Iql": [
      {
        "years": "2000-2026",
        "length": 5200,
        "width": 1950,
        "height": 1850,
        "weight": 3000
      }
    ]
  },
  "Dodge": {
    "Colt": [
      {
        "years": "1989-1994",
        "length": 3995,
        "width": 1670,
        "height": 1321,
        "weight": 1939
      }
    ],
    "Attitude Hatchback": [
      {
        "years": "2015-2024",
        "length": 4244,
        "width": 1669,
        "height": 1514,
        "weight": 2681
      }
    ],
    "Attitude Sedán": [
      {
        "years": "2006-2011",
        "length": 4280,
        "width": 1694,
        "height": 1471,
        "weight": 2666
      },
      {
        "years": "2025-2026",
        "length": 4700,
        "width": 1850,
        "height": 1489,
        "weight": 3000
      }
    ],
    "Shadow": [
      {
        "years": "1987-1994",
        "length": 4364,
        "width": 1709,
        "height": 1341,
        "weight": 2500
      }
    ],
    "Neon": [
      {
        "years": "1995-1999",
        "length": 4340,
        "width": 1710,
        "height": 1390,
        "weight": 2579
      },
      {
        "years": "2000-2005",
        "length": 4430,
        "width": 1710,
        "height": 1420,
        "weight": 2689
      },
      {
        "years": "2017-2021",
        "length": 4532,
        "width": 1792,
        "height": 1497,
        "weight": 3000
      }
    ],
    "Caliber": [
      {
        "years": "2007-2012",
        "length": 4415,
        "width": 1800,
        "height": 1535,
        "weight": 3000
      }
    ],
    "Viper RT 10": [
      {
        "years": "1992-2002",
        "length": 4448,
        "width": 1923,
        "height": 1118,
        "weight": 2391
      }
    ],
    "Viper GTS": [
      {
        "years": "1996-2002",
        "length": 4488,
        "width": 1923,
        "height": 1194,
        "weight": 2576
      },
      {
        "years": "2013-2017",
        "length": 4463,
        "width": 1941,
        "height": 1247,
        "weight": 2701
      }
    ],
    "Cavalier": [
      {
        "years": "1995-2005",
        "length": 4500,
        "width": 1710,
        "height": 1350,
        "weight": 2597
      }
    ],
    "Hornet": [
      {
        "years": "2023-2026",
        "length": 4528,
        "width": 1836,
        "height": 1620,
        "weight": 3000
      }
    ],
    "Stealth": [
      {
        "years": "1991-1996",
        "length": 4545,
        "width": 1840,
        "height": 1285,
        "weight": 3000
      }
    ],
    "Nitro": [
      {
        "years": "2007-2012",
        "length": 4584,
        "width": 1857,
        "height": 1773,
        "weight": 3000
      }
    ],
    "Spirit": [
      {
        "years": "1989-1995",
        "length": 4602,
        "width": 1730,
        "height": 1359,
        "weight": 3000
      }
    ],
    "Dart": [
      {
        "years": "2013-2016",
        "length": 4671,
        "width": 1830,
        "height": 1466,
        "weight": 3000
      }
    ],
    "Journey": [
      {
        "years": "2022-2026",
        "length": 4695,
        "width": 1870,
        "height": 1691,
        "weight": 3000
      },
      {
        "years": "2009-2020",
        "length": 4887,
        "width": 1834,
        "height": 1692,
        "weight": 3000
      }
    ],
    "Stratus": [
      {
        "years": "1995-2000",
        "length": 4724,
        "width": 1803,
        "height": 1374,
        "weight": 3000
      },
      {
        "years": "2001-2006",
        "length": 4856,
        "width": 1793,
        "height": 1394,
        "weight": 3000
      }
    ],
    "Caravan": [
      {
        "years": "1984-1995",
        "length": 4468,
        "width": 1830,
        "height": 1640,
        "weight": 3000
      },
      {
        "years": "1996-2000",
        "length": 4730,
        "width": 1920,
        "height": 1740,
        "weight": 3000
      },
      {
        "years": "2001-2007",
        "length": 4808,
        "width": 1996,
        "height": 1750,
        "weight": 3000
      }
    ],
    "Avenger": [
      {
        "years": "1995-2000",
        "length": 4755,
        "width": 1750,
        "height": 1346,
        "weight": 3000
      },
      {
        "years": "2008-2014",
        "length": 4850,
        "width": 1841,
        "height": 1491,
        "weight": 3000
      }
    ],
    "Challenger": [
      {
        "years": "1970-1974",
        "length": 4860,
        "width": 1930,
        "height": 1290,
        "weight": 3000
      },
      {
        "years": "2008-2023",
        "length": 5027,
        "width": 1923,
        "height": 1460,
        "weight": 3000
      }
    ],
    "Ram Van (Corta)": [
      {
        "years": "1971-2003",
        "length": 4882,
        "width": 2002,
        "height": 2024,
        "weight": 3000
      }
    ],
    "Durango": [
      {
        "years": "1998-2003",
        "length": 4910,
        "width": 1816,
        "height": 1854,
        "weight": 3000
      },
      {
        "years": "2004-2009",
        "length": 5100,
        "width": 1930,
        "height": 1897,
        "weight": 3000
      },
      {
        "years": "2011-2026",
        "length": 5110,
        "width": 1925,
        "height": 1801,
        "weight": 3000
      }
    ],
    "Magnum": [
      {
        "years": "2005-2008",
        "length": 5022,
        "width": 1882,
        "height": 1481,
        "weight": 3000
      }
    ],
    "Charger": [
      {
        "years": "2011-2023",
        "length": 5040,
        "width": 1905,
        "height": 1478,
        "weight": 3000
      },
      {
        "years": "2006-2010",
        "length": 5082,
        "width": 1891,
        "height": 1478,
        "weight": 3000
      },
      {
        "years": "2024-2026",
        "length": 5248,
        "width": 2022,
        "height": 1499,
        "weight": 3000
      }
    ],
    "Grand Caravan": [
      {
        "years": "1987-1995",
        "length": 4880,
        "width": 1830,
        "height": 1640,
        "weight": 3000
      },
      {
        "years": "1996-2000",
        "length": 5070,
        "width": 1920,
        "height": 1740,
        "weight": 3000
      },
      {
        "years": "2001-2007",
        "length": 5093,
        "width": 1996,
        "height": 1750,
        "weight": 3000
      },
      {
        "years": "2008-2020",
        "length": 5144,
        "width": 1953,
        "height": 1750,
        "weight": 3000
      }
    ],
    "Intrepid": [
      {
        "years": "1993-1997",
        "length": 5123,
        "width": 1890,
        "height": 1430,
        "weight": 3000
      },
      {
        "years": "1998-2004",
        "length": 5174,
        "width": 1897,
        "height": 1420,
        "weight": 3000
      }
    ],
    "Charger ": [
      {
        "years": "1966-1970",
        "length": 5296,
        "width": 1948,
        "height": 1350,
        "weight": 3000
      }
    ],
    "Ram Van (Larga)": [
      {
        "years": "1971-2003",
        "length": 5872,
        "width": 2002,
        "height": 2024,
        "weight": 3000
      }
    ],
    "Viper": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Ram": [
      {
        "years": "2000-2026",
        "length": 5300,
        "width": 1900,
        "height": 1800,
        "weight": 3000
      }
    ],
    "Dakota": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Caravan/grand Caravan": [
      {
        "years": "2000-2026",
        "length": 5100,
        "width": 2000,
        "height": 1750,
        "weight": 3000
      }
    ],
    "Sprinter": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Ramcharger": [
      {
        "years": "2000-2026",
        "length": 5300,
        "width": 1900,
        "height": 1800,
        "weight": 3000
      }
    ],
    "Ram Van": [
      {
        "years": "2000-2026",
        "length": 5300,
        "width": 1900,
        "height": 1800,
        "weight": 3000
      }
    ],
    "Ram Wagon": [
      {
        "years": "2000-2026",
        "length": 5300,
        "width": 1900,
        "height": 1800,
        "weight": 3000
      }
    ],
    "Daytona": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Monaco": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Shelby Charger": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Diplomat": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Mirada": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Ram 50": [
      {
        "years": "2000-2026",
        "length": 5300,
        "width": 1900,
        "height": 1800,
        "weight": 3000
      }
    ],
    "Raider": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Mini Ram": [
      {
        "years": "2000-2026",
        "length": 5300,
        "width": 1900,
        "height": 1800,
        "weight": 3000
      }
    ],
    "Royal Mini Ram Van": [
      {
        "years": "2000-2026",
        "length": 5300,
        "width": 1900,
        "height": 1800,
        "weight": 3000
      }
    ],
    "Rd200 / Rd250": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ]
  },
  "Lincoln": {
    "Mark VII": [
      {
        "years": "1984-1992",
        "length": 5151,
        "width": 1801,
        "height": 1377,
        "weight": 3000
      }
    ],
    "MKC": [
      {
        "years": "2015-2019",
        "length": 4552,
        "width": 1864,
        "height": 1656,
        "weight": 3000
      }
    ],
    "Corsair": [
      {
        "years": "2020-2026",
        "length": 4587,
        "width": 1887,
        "height": 1628,
        "weight": 3000
      }
    ],
    "MKX": [
      {
        "years": "2007-2015",
        "length": 4735,
        "width": 1925,
        "height": 1715,
        "weight": 3000
      },
      {
        "years": "2016-2018",
        "length": 4826,
        "width": 1933,
        "height": 1681,
        "weight": 3000
      }
    ],
    "Nautilus": [
      {
        "years": "2019-2023",
        "length": 4826,
        "width": 1933,
        "height": 1681,
        "weight": 3000
      },
      {
        "years": "2024-2026",
        "length": 4907,
        "width": 1946,
        "height": 1717,
        "weight": 3000
      }
    ],
    "MKZ": [
      {
        "years": "2007-2012",
        "length": 4839,
        "width": 1834,
        "height": 1453,
        "weight": 3000
      },
      {
        "years": "2013-2020",
        "length": 4930,
        "width": 1864,
        "height": 1476,
        "weight": 3000
      }
    ],
    "LS": [
      {
        "years": "2000-2006",
        "length": 4925,
        "width": 1859,
        "height": 1422,
        "weight": 3000
      }
    ],
    "Mark VIII": [
      {
        "years": "1993-1998",
        "length": 5265,
        "width": 1895,
        "height": 1361,
        "weight": 3000
      }
    ],
    "Aviator": [
      {
        "years": "2003-2005",
        "length": 4910,
        "width": 1877,
        "height": 1826,
        "weight": 3000
      },
      {
        "years": "2020-2026",
        "length": 5062,
        "width": 2022,
        "height": 1768,
        "weight": 3000
      }
    ],
    "Continental": [
      {
        "years": "1988-1994",
        "length": 5210,
        "width": 1857,
        "height": 1412,
        "weight": 3000
      },
      {
        "years": "1995-2002",
        "length": 5304,
        "width": 1870,
        "height": 1420,
        "weight": 3000
      },
      {
        "years": "2017-2020",
        "length": 5116,
        "width": 1913,
        "height": 1486,
        "weight": 3000
      }
    ],
    "MKS": [
      {
        "years": "2009-2016",
        "length": 5184,
        "width": 1928,
        "height": 1565,
        "weight": 3000
      }
    ],
    "Navigator": [
      {
        "years": "1998-2002",
        "length": 5202,
        "width": 2027,
        "height": 1948,
        "weight": 3000
      },
      {
        "years": "2003-2006",
        "length": 5232,
        "width": 2037,
        "height": 1976,
        "weight": 3000
      },
      {
        "years": "2007-2017",
        "length": 5293,
        "width": 2002,
        "height": 1984,
        "weight": 3000
      },
      {
        "years": "2018-2026",
        "length": 5334,
        "width": 2029,
        "height": 1938,
        "weight": 3000
      }
    ],
    "MKT": [
      {
        "years": "2010-2019",
        "length": 5273,
        "width": 1930,
        "height": 1712,
        "weight": 3000
      }
    ],
    "Town Car": [
      {
        "years": "1990-1997",
        "length": 5560,
        "width": 1953,
        "height": 1440,
        "weight": 3000
      },
      {
        "years": "1998-2011",
        "length": 5471,
        "width": 1986,
        "height": 1499,
        "weight": 3000
      }
    ],
    "Town Car Cartier L": [
      {
        "years": "2001-2011",
        "length": 5624,
        "width": 1986,
        "height": 1501,
        "weight": 3000
      }
    ],
    "Blackwood Pickup": [
      {
        "years": "2002",
        "length": 5610,
        "width": 1980,
        "height": 1870,
        "weight": 3000
      }
    ],
    "Mark LT Pickup": [
      {
        "years": "2006-2008",
        "length": 5685,
        "width": 2004,
        "height": 1880,
        "weight": 3000
      },
      {
        "years": "2010-2014",
        "length": 5620,
        "width": 2012,
        "height": 1920,
        "weight": 3000
      }
    ],
    "Navigator L Extendida": [
      {
        "years": "2007-2017",
        "length": 5672,
        "width": 2002,
        "height": 1981,
        "weight": 3000
      },
      {
        "years": "2018-2026",
        "length": 5636,
        "width": 2029,
        "height": 1933,
        "weight": 3000
      }
    ],
    "Zephyr": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Mark Lt": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Blackwood": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Mark": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Navigator L": [
      {
        "years": "2000-2026",
        "length": 5200,
        "width": 1950,
        "height": 1850,
        "weight": 3000
      }
    ]
  },
  "Chrysler": {
    "Crossfire": [
      {
        "years": "2004-2008",
        "length": 4059,
        "width": 1765,
        "height": 1303,
        "weight": 2334
      }
    ],
    "Attitude": [
      {
        "years": "2006-2011",
        "length": 4280,
        "width": 1694,
        "height": 1471,
        "weight": 2666
      }
    ],
    "PT Cruiser": [
      {
        "years": "2001-2010",
        "length": 4288,
        "width": 1704,
        "height": 1600,
        "weight": 2923
      }
    ],
    "Neon": [
      {
        "years": "1995-1999",
        "length": 4340,
        "width": 1710,
        "height": 1390,
        "weight": 2579
      },
      {
        "years": "2000-2005",
        "length": 4430,
        "width": 1710,
        "height": 1420,
        "weight": 2689
      }
    ],
    "LeBaron Sedán": [
      {
        "years": "1982-1988",
        "length": 4564,
        "width": 1727,
        "height": 1346,
        "weight": 2971
      }
    ],
    "Cirrus": [
      {
        "years": "1995-2000",
        "length": 4724,
        "width": 1803,
        "height": 1374,
        "weight": 3000
      }
    ],
    "Sebring": [
      {
        "years": "1995-2000",
        "length": 4750,
        "width": 1750,
        "height": 1346,
        "weight": 3000
      },
      {
        "years": "2001-2006",
        "length": 4844,
        "width": 1793,
        "height": 1394,
        "weight": 3000
      },
      {
        "years": "2007-2010",
        "length": 4841,
        "width": 1808,
        "height": 1499,
        "weight": 3000
      }
    ],
    "200 Sedán": [
      {
        "years": "2011-2014",
        "length": 4870,
        "width": 1841,
        "height": 1483,
        "weight": 3000
      },
      {
        "years": "2015-2017",
        "length": 4884,
        "width": 1871,
        "height": 1491,
        "weight": 3000
      }
    ],
    "300 Sedán": [
      {
        "years": "2005-2010",
        "length": 4999,
        "width": 1880,
        "height": 1483,
        "weight": 3000
      },
      {
        "years": "2011-2023",
        "length": 5044,
        "width": 1902,
        "height": 1485,
        "weight": 3000
      }
    ],
    "300M": [
      {
        "years": "1999-2004",
        "length": 5024,
        "width": 1890,
        "height": 1422,
        "weight": 3000
      }
    ],
    "Concorde": [
      {
        "years": "1993-1997",
        "length": 5151,
        "width": 1890,
        "height": 1430,
        "weight": 3000
      },
      {
        "years": "1998-2004",
        "length": 5311,
        "width": 1892,
        "height": 1420,
        "weight": 3000
      }
    ],
    "LHS": [
      {
        "years": "1994-1997",
        "length": 5268,
        "width": 1890,
        "height": 1412,
        "weight": 3000
      },
      {
        "years": "1999-2001",
        "length": 5136,
        "width": 1892,
        "height": 1422,
        "weight": 3000
      }
    ],
    "Aspen": [
      {
        "years": "2007-2009",
        "length": 5100,
        "width": 1930,
        "height": 1887,
        "weight": 3000
      }
    ],
    "Town y Country": [
      {
        "years": "1990-1995",
        "length": 4897,
        "width": 1830,
        "height": 1640,
        "weight": 3000
      },
      {
        "years": "1996-2000",
        "length": 5070,
        "width": 1920,
        "height": 1740,
        "weight": 3000
      },
      {
        "years": "2001-2007",
        "length": 5093,
        "width": 1996,
        "height": 1750,
        "weight": 3000
      },
      {
        "years": "2008-2016",
        "length": 5144,
        "width": 1953,
        "height": 1750,
        "weight": 3000
      }
    ],
    "Pacifica": [
      {
        "years": "2004-2008",
        "length": 5052,
        "width": 2014,
        "height": 1689,
        "weight": 3000
      },
      {
        "years": "2017-2026",
        "length": 5176,
        "width": 2022,
        "height": 1775,
        "weight": 3000
      }
    ],
    "Voyager": [
      {
        "years": "2020-2026",
        "length": 5176,
        "width": 2022,
        "height": 1775,
        "weight": 3000
      }
    ],
    "Imperial": [
      {
        "years": "1990-1993",
        "length": 5156,
        "width": 1750,
        "height": 1380,
        "weight": 3000
      }
    ],
    "Town And Country": [
      {
        "years": "2000-2026",
        "length": 5100,
        "width": 2000,
        "height": 1750,
        "weight": 3000
      }
    ],
    "Grand Voyager": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Intrepid": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "New Yorker": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Vision": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Viper": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Shadow": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Prowler": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Caravan": [
      {
        "years": "2000-2026",
        "length": 5100,
        "width": 2000,
        "height": 1750,
        "weight": 3000
      }
    ],
    "Lebaron": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Concorde/lhs": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Daytona": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Fifth Avenue": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Executive": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "E-class": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Cordoba": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Grand Caravan": [
      {
        "years": "2000-2026",
        "length": 5100,
        "width": 2000,
        "height": 1750,
        "weight": 3000
      }
    ]
  },
  "Buick": {
    "Encore": [
      {
        "years": "2013-2022",
        "length": 4277,
        "width": 1775,
        "height": 1646,
        "weight": 3000
      }
    ],
    "Encore GX": [
      {
        "years": "2020-2026",
        "length": 4346,
        "width": 1814,
        "height": 1621,
        "weight": 3000
      }
    ],
    "Skyhawk": [
      {
        "years": "1982-1989",
        "length": 4400,
        "width": 1650,
        "height": 1350,
        "weight": 2450
      }
    ],
    "Envista": [
      {
        "years": "2024-2026",
        "length": 4638,
        "width": 1816,
        "height": 1557,
        "weight": 3000
      }
    ],
    "Envision": [
      {
        "years": "2016-2020",
        "length": 4666,
        "width": 1839,
        "height": 1697,
        "weight": 3000
      },
      {
        "years": "2021-2026",
        "length": 4636,
        "width": 1882,
        "height": 1641,
        "weight": 3000
      }
    ],
    "Verano": [
      {
        "years": "2012-2017",
        "length": 4671,
        "width": 1814,
        "height": 1476,
        "weight": 3000
      }
    ],
    "Skylark": [
      {
        "years": "1992-1998",
        "length": 4790,
        "width": 1740,
        "height": 1350,
        "weight": 3000
      }
    ],
    "Regal": [
      {
        "years": "1997-2004",
        "length": 4983,
        "width": 1847,
        "height": 1438,
        "weight": 3000
      },
      {
        "years": "2011-2017",
        "length": 4831,
        "width": 1857,
        "height": 1483,
        "weight": 3000
      },
      {
        "years": "2018-2020",
        "length": 4895,
        "width": 1864,
        "height": 1455,
        "weight": 3000
      }
    ],
    "Century ": [
      {
        "years": "1997-2005",
        "length": 4943,
        "width": 1847,
        "height": 1438,
        "weight": 3000
      }
    ],
    "LaCrosse": [
      {
        "years": "2005-2009",
        "length": 5032,
        "width": 1854,
        "height": 1463,
        "weight": 3000
      },
      {
        "years": "2010-2016",
        "length": 5001,
        "width": 1857,
        "height": 1496,
        "weight": 3000
      },
      {
        "years": "2017-2019",
        "length": 5017,
        "width": 1859,
        "height": 1461,
        "weight": 3000
      }
    ],
    "LeSabre": [
      {
        "years": "2000-2005",
        "length": 5080,
        "width": 1867,
        "height": 1448,
        "weight": 3000
      }
    ],
    "Lucerne": [
      {
        "years": "2006-2011",
        "length": 5161,
        "width": 1875,
        "height": 1473,
        "weight": 3000
      }
    ],
    "Enclave": [
      {
        "years": "2008-2017",
        "length": 5126,
        "width": 2007,
        "height": 1842,
        "weight": 3000
      },
      {
        "years": "2018-2024",
        "length": 5189,
        "width": 2002,
        "height": 1775,
        "weight": 3000
      },
      {
        "years": "2025-2026",
        "length": 5195,
        "width": 2022,
        "height": 1803,
        "weight": 3000
      }
    ],
    "Park Avenue": [
      {
        "years": "1991-1996",
        "length": 5212,
        "width": 1902,
        "height": 1405,
        "weight": 3000
      },
      {
        "years": "1997-2005",
        "length": 5253,
        "width": 1897,
        "height": 1458,
        "weight": 3000
      }
    ],
    "Rainier": [
      {
        "years": "2004-2007",
        "length": 4869,
        "width": 1897,
        "height": 1895,
        "weight": 3000
      }
    ],
    "Terraza": [
      {
        "years": "2005-2007",
        "length": 5202,
        "width": 1829,
        "height": 1826,
        "weight": 3000
      }
    ],
    "Allure": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Rendezvous": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Riviera": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Cascada": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Reatta": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Electra": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Regal Tourx": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ]
  },
  "Pontiac": {
    "Solstice": [
      {
        "years": "2006-2010",
        "length": 3993,
        "width": 1811,
        "height": 1273,
        "weight": 2025
      }
    ],
    "Vibe": [
      {
        "years": "2003-2008",
        "length": 4350,
        "width": 1775,
        "height": 1540,
        "weight": 2973
      },
      {
        "years": "2009-2010",
        "length": 4371,
        "width": 1763,
        "height": 1547,
        "weight": 2980
      }
    ],
    "Aztek": [
      {
        "years": "2001-2005",
        "length": 4623,
        "width": 1872,
        "height": 1694,
        "weight": 3000
      }
    ],
    "Grand Am": [
      {
        "years": "1999-2005",
        "length": 4732,
        "width": 1788,
        "height": 1395,
        "weight": 3000
      }
    ],
    "G6": [
      {
        "years": "2005-2010",
        "length": 4803,
        "width": 1788,
        "height": 1450,
        "weight": 3000
      }
    ],
    "GTO": [
      {
        "years": "2004-2006",
        "length": 4821,
        "width": 1842,
        "height": 1394,
        "weight": 3000
      }
    ],
    "Firebird": [
      {
        "years": "1993-2002",
        "length": 4910,
        "width": 1892,
        "height": 1321,
        "weight": 3000
      }
    ],
    "Grand Prix": [
      {
        "years": "1997-2003",
        "length": 4991,
        "width": 1847,
        "height": 1389,
        "weight": 3000
      },
      {
        "years": "2004-2008",
        "length": 5037,
        "width": 1869,
        "height": 1415,
        "weight": 3000
      }
    ],
    "Montana": [
      {
        "years": "1999-2005",
        "length": 5110,
        "width": 1847,
        "height": 1715,
        "weight": 3000
      }
    ],
    "Bonneville": [
      {
        "years": "2000-2005",
        "length": 5146,
        "width": 1885,
        "height": 1438,
        "weight": 3000
      }
    ],
    "Wave": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Montana Sv6": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Torrent": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Matiz": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Sunfire": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Sunbird": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Firefly": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Lemans": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Parisienne": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Fiero": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Sunbird 2000": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Grand Lemans": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Catalina": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Safari": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Acadian": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Laurentian": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ]
  },
  "Saturn": {
    "Sky": [
      {
        "years": "2007-2010",
        "length": 4092,
        "width": 1814,
        "height": 1273,
        "weight": 2362
      }
    ],
    "Ion Hatchback": [
      {
        "years": "2003-2007",
        "length": 4536,
        "width": 1725,
        "height": 1415,
        "weight": 3000
      }
    ],
    "Ion Sedán": [
      {
        "years": "2003-2007",
        "length": 4686,
        "width": 1707,
        "height": 1458,
        "weight": 3000
      }
    ],
    "Vue": [
      {
        "years": "2008-2010",
        "length": 4575,
        "width": 1852,
        "height": 1704,
        "weight": 3000
      },
      {
        "years": "2002-2007",
        "length": 4605,
        "width": 1816,
        "height": 1689,
        "weight": 3000
      }
    ],
    "L Series": [
      {
        "years": "2000-2005",
        "length": 4836,
        "width": 1750,
        "height": 1422,
        "weight": 3000
      }
    ],
    "Aura": [
      {
        "years": "2007-2010",
        "length": 4851,
        "width": 1786,
        "height": 1463,
        "weight": 3000
      }
    ],
    "Outlook": [
      {
        "years": "2007-2010",
        "length": 5100,
        "width": 1991,
        "height": 1773,
        "weight": 3000
      }
    ],
    "Ion": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Relay": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ]
  },
  "Mercury": {
    "Mariner": [
      {
        "years": "2005-2011",
        "length": 4442,
        "width": 1781,
        "height": 1720,
        "weight": 3000
      }
    ],
    "Villager": [
      {
        "years": "1993-2002",
        "length": 4823,
        "width": 1900,
        "height": 1730,
        "weight": 3000
      }
    ],
    "Mountaineer": [
      {
        "years": "1997-2001",
        "length": 4831,
        "width": 1783,
        "height": 1803,
        "weight": 3000
      },
      {
        "years": "2002-2010",
        "length": 4910,
        "width": 1872,
        "height": 1826,
        "weight": 3000
      }
    ],
    "Milan": [
      {
        "years": "2006-2011",
        "length": 4862,
        "width": 1834,
        "height": 1445,
        "weight": 3000
      }
    ],
    "Sable": [
      {
        "years": "1996-2005",
        "length": 5072,
        "width": 1854,
        "height": 1402,
        "weight": 3000
      },
      {
        "years": "2008-2009",
        "length": 5133,
        "width": 1892,
        "height": 1562,
        "weight": 3000
      }
    ],
    "Montego": [
      {
        "years": "2005-2007",
        "length": 5090,
        "width": 1892,
        "height": 1562,
        "weight": 3000
      }
    ],
    "Grand Marquis": [
      {
        "years": "1998-2011",
        "length": 5382,
        "width": 1986,
        "height": 1443,
        "weight": 3000
      },
      {
        "years": "1992-1997",
        "length": 5395,
        "width": 1968,
        "height": 1440,
        "weight": 3000
      }
    ],
    "Monterey": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Cougar": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Tracer": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Capri": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Topaz": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Lynx": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Zephyr": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Marauder": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ]
  },
  "Oldsmobile": {
    "Bravada": [
      {
        "years": "1996-2001",
        "length": 4600,
        "width": 1710,
        "height": 1610,
        "weight": 3000
      },
      {
        "years": "2002-2004",
        "length": 4870,
        "width": 1897,
        "height": 1895,
        "weight": 3000
      }
    ],
    "Alero": [
      {
        "years": "1999-2004",
        "length": 4742,
        "width": 1781,
        "height": 1410,
        "weight": 3000
      }
    ],
    "Cutlass": [
      {
        "years": "1997-1999",
        "length": 4877,
        "width": 1750,
        "height": 1420,
        "weight": 3000
      }
    ],
    "Intrigue": [
      {
        "years": "1998-2002",
        "length": 4983,
        "width": 1869,
        "height": 1438,
        "weight": 3000
      }
    ],
    "Silhouette": [
      {
        "years": "1997-2004",
        "length": 5113,
        "width": 1847,
        "height": 1712,
        "weight": 3000
      }
    ],
    "Aurora": [
      {
        "years": "1995-2003",
        "length": 5116,
        "width": 1890,
        "height": 1420,
        "weight": 3000
      }
    ],
    "Regency": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Eighty Eight (88)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Achieva": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Cutlass Supreme": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Ninety Eight (98)": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Toronado": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Cutlass Calais": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Firenza": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Omega": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Cutlass Ciera": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Delta 88": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Cutlass Cruiser": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Cutlass Salon": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ]
  },
  "Plymouth": {
    "Prowler": [
      {
        "years": "1997-2002",
        "length": 4191,
        "width": 1943,
        "height": 1293,
        "weight": 2632
      }
    ],
    "Neon": [
      {
        "years": "1995-2001",
        "length": 4340,
        "width": 1710,
        "height": 1390,
        "weight": 2579
      }
    ],
    "Breeze": [
      {
        "years": "1996-2000",
        "length": 4724,
        "width": 1803,
        "height": 1374,
        "weight": 3000
      }
    ],
    "Voyager": [
      {
        "years": "1996-2000",
        "length": 4730,
        "width": 1920,
        "height": 1740,
        "weight": 3000
      }
    ],
    "Grand Voyager": [
      {
        "years": "1996-2000",
        "length": 5070,
        "width": 1920,
        "height": 1740,
        "weight": 3000
      }
    ],
    "Acclaim": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Colt": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Sundance": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Laser": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Caravelle": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Gran Fury": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Scamp": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Arrow": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ]
  },
  "Rivian": {
    "R3": [
      {
        "years": "2026",
        "length": 4320,
        "width": 1900,
        "height": 1560,
        "weight": 3000
      }
    ],
    "R2": [
      {
        "years": "2026",
        "length": 4715,
        "width": 1905,
        "height": 1700,
        "weight": 3000
      }
    ],
    "R1S": [
      {
        "years": "2022-2026",
        "length": 5100,
        "width": 2014,
        "height": 1816,
        "weight": 3000
      }
    ],
    "R1T": [
      {
        "years": "2022-2026",
        "length": 5514,
        "width": 2014,
        "height": 1816,
        "weight": 3000
      }
    ]
  },
  "Lucid": {
    "Air": [
      {
        "years": "2022-2026",
        "length": 4976,
        "width": 1938,
        "height": 1410,
        "weight": 3000
      }
    ],
    "Gravity": [
      {
        "years": "2025-2026",
        "length": 5034,
        "width": 1999,
        "height": 1656,
        "weight": 3000
      }
    ]
  },
  "Shelby": {
    "Series 1": [
      {
        "years": "1998-2005",
        "length": 4293,
        "width": 1943,
        "height": 1194,
        "weight": 2490
      }
    ],
    "GT350 / GT500": [
      {
        "years": "2015-2022",
        "length": 4810,
        "width": 1920,
        "height": 1380,
        "weight": 3000
      }
    ],
    "F-150 Super Snake": [
      {
        "years": "2017-2026",
        "length": 5890,
        "width": 2030,
        "height": 1920,
        "weight": 3000
      }
    ],
    "Cobra": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Shelby": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ]
  },
  "BYD": {
    "Seagull": [
      {
        "years": "2024-2026",
        "length": 3780,
        "width": 1715,
        "height": 1540,
        "weight": 2196
      }
    ],
    "Dolphin": [
      {
        "years": "2023-2025",
        "length": 4125,
        "width": 1770,
        "height": 1570,
        "weight": 2866
      },
      {
        "years": "2026",
        "length": 4290,
        "width": 1770,
        "height": 1570,
        "weight": 2980
      }
    ],
    "Yuan Pro": [
      {
        "years": "2021-2026",
        "length": 4375,
        "width": 1785,
        "height": 1680,
        "weight": 3000
      }
    ],
    "Yuan Plus": [
      {
        "years": "2022-2026",
        "length": 4455,
        "width": 1875,
        "height": 1615,
        "weight": 3000
      }
    ],
    "Song": [
      {
        "years": "2021-2026",
        "length": 4705,
        "width": 1890,
        "height": 1680,
        "weight": 3000
      }
    ],
    "Song Plus": [
      {
        "years": "2024-2026",
        "length": 4775,
        "width": 1890,
        "height": 1670,
        "weight": 3000
      }
    ],
    "Seal": [
      {
        "years": "2023-2026",
        "length": 4800,
        "width": 1875,
        "height": 1460,
        "weight": 3000
      }
    ],
    "Tang": [
      {
        "years": "2019-2026",
        "length": 4870,
        "width": 1950,
        "height": 1725,
        "weight": 3000
      }
    ],
    "Han": [
      {
        "years": "2021-2026",
        "length": 4995,
        "width": 1910,
        "height": 1495,
        "weight": 3000
      }
    ],
    "Shark": [
      {
        "years": "2025-2026",
        "length": 5457,
        "width": 1971,
        "height": 1925,
        "weight": 3000
      }
    ],
    "Electric Truck": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Achiever": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Creator": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Dreamer": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ]
  },
  "MG": {
    "MG3": [
      {
        "years": "2013-2023",
        "length": 4018,
        "width": 1729,
        "height": 1507,
        "weight": 2617
      },
      {
        "years": "2024-2026",
        "length": 4113,
        "width": 1797,
        "height": 1502,
        "weight": 2775
      }
    ],
    "MG4": [
      {
        "years": "2023-2026",
        "length": 4287,
        "width": 1836,
        "height": 1504,
        "weight": 2959
      }
    ],
    "ZS": [
      {
        "years": "2017-2026",
        "length": 4323,
        "width": 1809,
        "height": 1653,
        "weight": 3000
      }
    ],
    "ZX": [
      {
        "years": "2021-2026",
        "length": 4323,
        "width": 1809,
        "height": 1653,
        "weight": 3000
      }
    ],
    "Cyberster": [
      {
        "years": "2024-2026",
        "length": 4535,
        "width": 1913,
        "height": 1329,
        "weight": 3000
      }
    ],
    "HS": [
      {
        "years": "2020-2026",
        "length": 4574,
        "width": 1876,
        "height": 1664,
        "weight": 3000
      }
    ],
    "EHS": [
      {
        "years": "2021-2026",
        "length": 4574,
        "width": 1876,
        "height": 1664,
        "weight": 3000
      }
    ],
    "GT": [
      {
        "years": "2022-2026",
        "length": 4675,
        "width": 1842,
        "height": 1473,
        "weight": 3000
      }
    ],
    "MG5": [
      {
        "years": "2021-2026",
        "length": 4675,
        "width": 1842,
        "height": 1473,
        "weight": 3000
      }
    ],
    "RX8": [
      {
        "years": "2021-2025",
        "length": 4923,
        "width": 1930,
        "height": 1840,
        "weight": 3000
      }
    ]
  },
  "Omoda": {
    "C3": [
      {
        "years": "2024-2026",
        "length": 4000,
        "width": 1760,
        "height": 1580,
        "weight": 2781
      }
    ],
    "C5": [
      {
        "years": "2023-2026",
        "length": 4400,
        "width": 1830,
        "height": 1588,
        "weight": 3000
      }
    ],
    "C7": [
      {
        "years": "2025-2026",
        "length": 4621,
        "width": 1872,
        "height": 1673,
        "weight": 3000
      }
    ]
  },
  "Jaecoo": {
    "J5": [
      {
        "years": "2025-2026",
        "length": 4338,
        "width": 1830,
        "height": 1641,
        "weight": 3000
      }
    ],
    "J7": [
      {
        "years": "2024-2026",
        "length": 4500,
        "width": 1865,
        "height": 1680,
        "weight": 3000
      }
    ],
    "J8": [
      {
        "years": "2024-2026",
        "length": 4820,
        "width": 1930,
        "height": 1699,
        "weight": 3000
      }
    ]
  },
  "Jetour": {
    "Dashing": [
      {
        "years": "2023-2026",
        "length": 4590,
        "width": 1900,
        "height": 1685,
        "weight": 3000
      }
    ],
    "X70": [
      {
        "years": "2020-2023",
        "length": 4720,
        "width": 1900,
        "height": 1710,
        "weight": 3000
      },
      {
        "years": "2024-2026",
        "length": 4743,
        "width": 1900,
        "height": 1720,
        "weight": 3000
      }
    ],
    "X90": [
      {
        "years": "2022-2026",
        "length": 4858,
        "width": 1925,
        "height": 1780,
        "weight": 3000
      }
    ],
    "T2": [
      {
        "years": "2024-2026",
        "length": 4785,
        "width": 2006,
        "height": 1880,
        "weight": 3000
      }
    ]
  },
  "Geely": {
    "GX3": [
      {
        "years": "2018-2026",
        "length": 4005,
        "width": 1760,
        "height": 1575,
        "weight": 2775
      }
    ],
    "Coolray": [
      {
        "years": "2020-2026",
        "length": 4330,
        "width": 1800,
        "height": 1609,
        "weight": 3000
      }
    ],
    "Geometry": [
      {
        "years": "2021-2023",
        "length": 4432,
        "width": 1833,
        "height": 1560,
        "weight": 3000
      },
      {
        "years": "2024-2026",
        "length": 4615,
        "width": 1901,
        "height": 1670,
        "weight": 3000
      }
    ],
    "Azkarra": [
      {
        "years": "2021-2025",
        "length": 4544,
        "width": 1831,
        "height": 1713,
        "weight": 3000
      }
    ],
    "Okavango": [
      {
        "years": "2021-2026",
        "length": 4835,
        "width": 1900,
        "height": 1785,
        "weight": 3000
      }
    ],
    "Monjaro": [
      {
        "years": "2023-2026",
        "length": 4770,
        "width": 1895,
        "height": 1689,
        "weight": 3000
      }
    ]
  },
  "Chery": {
    "Tiggo 2": [
      {
        "years": "2017-2026",
        "length": 4200,
        "width": 1760,
        "height": 1570,
        "weight": 2901
      }
    ],
    "Tiggo 4": [
      {
        "years": "2019-2026",
        "length": 4318,
        "width": 1830,
        "height": 1670,
        "weight": 3000
      }
    ],
    "Tiggo 7": [
      {
        "years": "2020-2026",
        "length": 4500,
        "width": 1842,
        "height": 1746,
        "weight": 3000
      }
    ],
    "Tiggo 8": [
      {
        "years": "2019-2026",
        "length": 4724,
        "width": 1860,
        "height": 1745,
        "weight": 3000
      }
    ],
    "Arrizo 5": [
      {
        "years": "2016-2023",
        "length": 4572,
        "width": 1825,
        "height": 1482,
        "weight": 3000
      }
    ]
  },
  "GWM": {
    "Ora 03": [
      {
        "years": "2023-2026",
        "length": 4235,
        "width": 1825,
        "height": 1603,
        "weight": 3000
      }
    ],
    "Jolion": [
      {
        "years": "2021-2026",
        "length": 4472,
        "width": 1841,
        "height": 1619,
        "weight": 3000
      }
    ],
    "Haval H6": [
      {
        "years": "2021-2026",
        "length": 4653,
        "width": 1886,
        "height": 1730,
        "weight": 3000
      }
    ],
    "Tank 300": [
      {
        "years": "2024-2026",
        "length": 4760,
        "width": 1930,
        "height": 1903,
        "weight": 3000
      }
    ],
    "Tank 500": [
      {
        "years": "2024-2026",
        "length": 5078,
        "width": 1934,
        "height": 1905,
        "weight": 3000
      }
    ],
    "Poer": [
      {
        "years": "2021-2026",
        "length": 5410,
        "width": 1934,
        "height": 1886,
        "weight": 3000
      }
    ]
  },
  "Aion": {
    "Y": [
      {
        "years": "2023-2026",
        "length": 4535,
        "width": 1870,
        "height": 1650,
        "weight": 3000
      }
    ],
    "V": [
      {
        "years": "2024-2026",
        "length": 4605,
        "width": 1854,
        "height": 1686,
        "weight": 3000
      }
    ],
    "LX": [
      {
        "years": "2024-2026",
        "length": 4835,
        "width": 1935,
        "height": 1685,
        "weight": 3000
      }
    ]
  },
  "Neta": {
    "V": [
      {
        "years": "2023-2026",
        "length": 4070,
        "width": 1690,
        "height": 1540,
        "weight": 2648
      }
    ],
    "AYA": [
      {
        "years": "2024-2026",
        "length": 4070,
        "width": 1690,
        "height": 1540,
        "weight": 2648
      }
    ],
    "X": [
      {
        "years": "2025-2026",
        "length": 4619,
        "width": 1860,
        "height": 1628,
        "weight": 3000
      }
    ],
    "GT": [
      {
        "years": "2024-2026",
        "length": 4715,
        "width": 1979,
        "height": 1415,
        "weight": 3000
      }
    ]
  },
  "JAC": {
    "JS2": [
      {
        "years": "2016-2026",
        "length": 4135,
        "width": 1750,
        "height": 1550,
        "weight": 2804
      }
    ],
    "JS3": [
      {
        "years": "2017-2025",
        "length": 4345,
        "width": 1765,
        "height": 1640,
        "weight": 3000
      }
    ],
    "JS4": [
      {
        "years": "2020-2026",
        "length": 4410,
        "width": 1800,
        "height": 1660,
        "weight": 3000
      }
    ],
    "JS6": [
      {
        "years": "2022-2026",
        "length": 4605,
        "width": 1890,
        "height": 1700,
        "weight": 3000
      }
    ],
    "JS8": [
      {
        "years": "2021-2026",
        "length": 4810,
        "width": 1870,
        "height": 1758,
        "weight": 3000
      }
    ],
    "T6": [
      {
        "years": "2016-2024",
        "length": 5315,
        "width": 1830,
        "height": 1815,
        "weight": 3000
      }
    ],
    "T8": [
      {
        "years": "2019-2026",
        "length": 5325,
        "width": 1880,
        "height": 1830,
        "weight": 3000
      }
    ],
    "Highlander": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Eagle": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Cobra": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Chateau": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ]
  },
  "Haval": {
    "Jolion": [
      {
        "years": "2021-2026",
        "length": 4472,
        "width": 1841,
        "height": 1619,
        "weight": 3000
      }
    ],
    "Dargo": [
      {
        "years": "2022-2026",
        "length": 4620,
        "width": 1890,
        "height": 1780,
        "weight": 3000
      }
    ],
    "H6": [
      {
        "years": "2021-2026",
        "length": 4653,
        "width": 1886,
        "height": 1730,
        "weight": 3000
      }
    ],
    "Raptor": [
      {
        "years": "2024-2026",
        "length": 4680,
        "width": 1916,
        "height": 1822,
        "weight": 3000
      }
    ],
    "H6 GT": [
      {
        "years": "2023-2026",
        "length": 4727,
        "width": 1940,
        "height": 1729,
        "weight": 3000
      }
    ]
  },
  "DFSK": {
    "Glory 500": [
      {
        "years": "2021-2026",
        "length": 4385,
        "width": 1850,
        "height": 1645,
        "weight": 3000
      }
    ],
    "Glory 560": [
      {
        "years": "2018-2025",
        "length": 4515,
        "width": 1815,
        "height": 1735,
        "weight": 3000
      }
    ],
    "Glory 580": [
      {
        "years": "2017-2026",
        "length": 4680,
        "width": 1845,
        "height": 1715,
        "weight": 3000
      }
    ],
    "Glory 600": [
      {
        "years": "2024-2026",
        "length": 4720,
        "width": 1900,
        "height": 1785,
        "weight": 3000
      }
    ],
    "E5": [
      {
        "years": "2024-2026",
        "length": 4760,
        "width": 1865,
        "height": 1710,
        "weight": 3000
      }
    ]
  },
  "Maxus": {
    "D60": [
      {
        "years": "2021-2026",
        "length": 4720,
        "width": 1860,
        "height": 1736,
        "weight": 3000
      }
    ],
    "D90": [
      {
        "years": "2019-2026",
        "length": 5005,
        "width": 1932,
        "height": 1875,
        "weight": 3000
      }
    ],
    "G10": [
      {
        "years": "2016-2025",
        "length": 5168,
        "width": 1980,
        "height": 1928,
        "weight": 3000
      }
    ],
    "T60": [
      {
        "years": "2017-2026",
        "length": 5365,
        "width": 1900,
        "height": 1809,
        "weight": 3000
      }
    ],
    "T90": [
      {
        "years": "2022-2026",
        "length": 5365,
        "width": 1900,
        "height": 1845,
        "weight": 3000
      }
    ],
    "V80": [
      {
        "years": "2015-2026",
        "length": 5700,
        "width": 1998,
        "height": 2345,
        "weight": 3000
      }
    ]
  },
  "Foton": {
    "Gratour": [
      {
        "years": "2016-2023",
        "length": 3915,
        "width": 1725,
        "height": 1845,
        "weight": 2741
      }
    ],
    "Tunland": [
      {
        "years": "2012-2020",
        "length": 5310,
        "width": 1880,
        "height": 1860,
        "weight": 3000
      }
    ],
    "Tunland G7": [
      {
        "years": "2021-2026",
        "length": 5340,
        "width": 1940,
        "height": 1870,
        "weight": 3000
      }
    ],
    "Tunland G9": [
      {
        "years": "2022-2026",
        "length": 5340,
        "width": 1940,
        "height": 1870,
        "weight": 3000
      }
    ],
    "View": [
      {
        "years": "2015-2026",
        "length": 5320,
        "width": 1695,
        "height": 2280,
        "weight": 3000
      }
    ]
  },
  "Zeekr": {
    "X": [
      {
        "years": "2024-2026",
        "length": 4450,
        "width": 1836,
        "height": 1572,
        "weight": 3000
      }
    ],
    "001": [
      {
        "years": "2023-2026",
        "length": 4970,
        "width": 1999,
        "height": 1560,
        "weight": 3000
      }
    ],
    "009": [
      {
        "years": "2024-2026",
        "length": 5209,
        "width": 2024,
        "height": 1848,
        "weight": 3000
      }
    ]
  },
  "Deepal": {
    "S07": [
      {
        "years": "2024-2026",
        "length": 4750,
        "width": 1930,
        "height": 1625,
        "weight": 3000
      }
    ],
    "L07": [
      {
        "years": "2024-2026",
        "length": 4820,
        "width": 1890,
        "height": 1480,
        "weight": 3000
      }
    ],
    "G318": [
      {
        "years": "2025-2026",
        "length": 5010,
        "width": 1985,
        "height": 1960,
        "weight": 3000
      }
    ]
  },
  "Exeed": {
    "LX": [
      {
        "years": "2022-2026",
        "length": 4533,
        "width": 1848,
        "height": 1699,
        "weight": 3000
      }
    ],
    "TXL": [
      {
        "years": "2022-2026",
        "length": 4780,
        "width": 1885,
        "height": 1730,
        "weight": 3000
      }
    ],
    "VX": [
      {
        "years": "2022-2026",
        "length": 4970,
        "width": 1940,
        "height": 1788,
        "weight": 3000
      }
    ]
  },
  "Changan": {
    "CS15": [
      {
        "years": "2016-2026",
        "length": 4135,
        "width": 1740,
        "height": 1630,
        "weight": 2932
      }
    ],
    "CS35": [
      {
        "years": "2019-2026",
        "length": 4335,
        "width": 1825,
        "height": 1660,
        "weight": 3000
      }
    ],
    "CS55": [
      {
        "years": "2021-2026",
        "length": 4515,
        "width": 1865,
        "height": 1680,
        "weight": 3000
      }
    ],
    "Uni-T": [
      {
        "years": "2021-2026",
        "length": 4515,
        "width": 1870,
        "height": 1565,
        "weight": 3000
      }
    ],
    "Uni-K": [
      {
        "years": "2022-2026",
        "length": 4865,
        "width": 1948,
        "height": 1695,
        "weight": 3000
      }
    ],
    "Hunter": [
      {
        "years": "2020-2026",
        "length": 5330,
        "width": 1930,
        "height": 1835,
        "weight": 3000
      }
    ]
  },
  "GAC": {
    "Emzoom": [
      {
        "years": "2024-2026",
        "length": 4410,
        "width": 1850,
        "height": 1600,
        "weight": 3000
      }
    ],
    "Emkoo": [
      {
        "years": "2024-2026",
        "length": 4680,
        "width": 1901,
        "height": 1670,
        "weight": 3000
      }
    ],
    "GS8": [
      {
        "years": "2022-2026",
        "length": 4980,
        "width": 1950,
        "height": 1780,
        "weight": 3000
      }
    ],
    "Legacy": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ]
  },
  "BAIC": {
    "X3": [
      {
        "years": "2019-2026",
        "length": 4325,
        "width": 1830,
        "height": 1640,
        "weight": 3000
      }
    ],
    "X35": [
      {
        "years": "2016-2024",
        "length": 4325,
        "width": 1830,
        "height": 1640,
        "weight": 3000
      }
    ],
    "X55": [
      {
        "years": "2017-2023",
        "length": 4480,
        "width": 1837,
        "height": 1680,
        "weight": 3000
      }
    ],
    "X55 II": [
      {
        "years": "2023-2026",
        "length": 4620,
        "width": 1886,
        "height": 1680,
        "weight": 3000
      }
    ],
    "BJ40": [
      {
        "years": "2014-2026",
        "length": 4630,
        "width": 1925,
        "height": 1871,
        "weight": 3000
      }
    ],
    "X7": [
      {
        "years": "2020-2026",
        "length": 4710,
        "width": 1892,
        "height": 1715,
        "weight": 3000
      }
    ]
  },
  "Soueast": {
    "DX3": [
      {
        "years": "2016-2026",
        "length": 4354,
        "width": 1840,
        "height": 1670,
        "weight": 3000
      }
    ],
    "DX5": [
      {
        "years": "2019-2024",
        "length": 4406,
        "width": 1840,
        "height": 1654,
        "weight": 3000
      }
    ],
    "DX7": [
      {
        "years": "2015-2026",
        "length": 4585,
        "width": 1900,
        "height": 1718,
        "weight": 3000
      }
    ]
  },
  "JMC": {
    "Vigus": [
      {
        "years": "2016-2021",
        "length": 5325,
        "width": 1810,
        "height": 1810,
        "weight": 3000
      },
      {
        "years": "2022-2026",
        "length": 5375,
        "width": 1905,
        "height": 1835,
        "weight": 3000
      }
    ],
    "Grand": [
      {
        "years": "2024-2026",
        "length": 5435,
        "width": 1935,
        "height": 1870,
        "weight": 3000
      }
    ]
  },
  "Karry": {
    "Q22": [
      {
        "years": "2012-2026",
        "length": 3998,
        "width": 1515,
        "height": 1830,
        "weight": 2439
      }
    ],
    "Yoyo / Van": [
      {
        "years": "2015-2026",
        "length": 4430,
        "width": 1626,
        "height": 1930,
        "weight": 3000
      }
    ]
  },
  "Karva": {
    "K1": [
      {
        "years": "2022-2026",
        "length": 4335,
        "width": 1825,
        "height": 1660,
        "weight": 3000
      }
    ],
    "K2": [
      {
        "years": "2022-2026",
        "length": 4515,
        "width": 1865,
        "height": 1680,
        "weight": 3000
      }
    ]
  },
  "Bestune": {
    "T33": [
      {
        "years": "2019-2024",
        "length": 4330,
        "width": 1810,
        "height": 1640,
        "weight": 3000
      }
    ],
    "T77": [
      {
        "years": "2019-2026",
        "length": 4525,
        "width": 1845,
        "height": 1615,
        "weight": 3000
      }
    ],
    "T99": [
      {
        "years": "2020-2026",
        "length": 4800,
        "width": 1915,
        "height": 1685,
        "weight": 3000
      }
    ]
  },
  "Dongfeng": {
    "Nano": [
      {
        "years": "2024-2026",
        "length": 4030,
        "width": 1810,
        "height": 1570,
        "weight": 2863
      }
    ],
    "AX7": [
      {
        "years": "2015-2026",
        "length": 4660,
        "width": 1880,
        "height": 1690,
        "weight": 3000
      }
    ],
    "Rich 6": [
      {
        "years": "2019-2026",
        "length": 5290,
        "width": 1850,
        "height": 1810,
        "weight": 3000
      }
    ],
    "Rich 7": [
      {
        "years": "2022-2026",
        "length": 5290,
        "width": 1910,
        "height": 1875,
        "weight": 3000
      }
    ]
  },
  "Bentley": {
    "Brooklands": [
      {
        "years": "2000-2026",
        "length": 5400,
        "width": 2000,
        "height": 1500,
        "weight": 3000
      }
    ],
    "Azure": [
      {
        "years": "2000-2026",
        "length": 5400,
        "width": 2000,
        "height": 1500,
        "weight": 3000
      }
    ],
    "Turbo": [
      {
        "years": "2000-2026",
        "length": 5400,
        "width": 2000,
        "height": 1500,
        "weight": 3000
      }
    ],
    "Mulsanne": [
      {
        "years": "2000-2026",
        "length": 5400,
        "width": 2000,
        "height": 1500,
        "weight": 3000
      }
    ],
    "Flying Spur": [
      {
        "years": "2000-2026",
        "length": 5400,
        "width": 2000,
        "height": 1500,
        "weight": 3000
      }
    ],
    "Eight": [
      {
        "years": "2000-2026",
        "length": 5400,
        "width": 2000,
        "height": 1500,
        "weight": 3000
      }
    ],
    "Arnage": [
      {
        "years": "2000-2026",
        "length": 5400,
        "width": 2000,
        "height": 1500,
        "weight": 3000
      }
    ],
    "Armoured Arnage": [
      {
        "years": "2000-2026",
        "length": 5400,
        "width": 2000,
        "height": 1500,
        "weight": 3000
      }
    ],
    "Roll Royce Silver Seraph": [
      {
        "years": "2000-2026",
        "length": 5400,
        "width": 2000,
        "height": 1500,
        "weight": 3000
      }
    ],
    "Rolls-royce Park Ward": [
      {
        "years": "2000-2026",
        "length": 5400,
        "width": 2000,
        "height": 1500,
        "weight": 3000
      }
    ],
    "Bentayga": [
      {
        "years": "2000-2026",
        "length": 5400,
        "width": 2000,
        "height": 1500,
        "weight": 3000
      }
    ],
    "Continental": [
      {
        "years": "2000-2026",
        "length": 5400,
        "width": 2000,
        "height": 1500,
        "weight": 3000
      }
    ]
  },
  "Citroen": {
    "Citroen": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ]
  },
  "Daihatsu": {
    "Charade": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Rocky": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Low Speed Vehicle": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ]
  },
  "Lotus": {
    "Evora": [
      {
        "years": "2000-2026",
        "length": 4400,
        "width": 1900,
        "height": 1300,
        "weight": 2717
      }
    ],
    "Elise": [
      {
        "years": "2000-2026",
        "length": 4400,
        "width": 1900,
        "height": 1300,
        "weight": 2717
      }
    ],
    "Eleven": [
      {
        "years": "2000-2026",
        "length": 4400,
        "width": 1900,
        "height": 1300,
        "weight": 2717
      }
    ],
    "Esprit": [
      {
        "years": "2000-2026",
        "length": 4400,
        "width": 1900,
        "height": 1300,
        "weight": 2717
      }
    ],
    "Eagle": [
      {
        "years": "2000-2026",
        "length": 4400,
        "width": 1900,
        "height": 1300,
        "weight": 2717
      }
    ],
    "Europa": [
      {
        "years": "2000-2026",
        "length": 4400,
        "width": 1900,
        "height": 1300,
        "weight": 2717
      }
    ],
    "Monaco": [
      {
        "years": "2000-2026",
        "length": 4400,
        "width": 1900,
        "height": 1300,
        "weight": 2717
      }
    ],
    "Elite": [
      {
        "years": "2000-2026",
        "length": 4400,
        "width": 1900,
        "height": 1300,
        "weight": 2717
      }
    ],
    "Eclat": [
      {
        "years": "2000-2026",
        "length": 4400,
        "width": 1900,
        "height": 1300,
        "weight": 2717
      }
    ],
    "Elan": [
      {
        "years": "2000-2026",
        "length": 4400,
        "width": 1900,
        "height": 1300,
        "weight": 2717
      }
    ],
    "Exige": [
      {
        "years": "2000-2026",
        "length": 4400,
        "width": 1900,
        "height": 1300,
        "weight": 2717
      }
    ],
    "Spa": [
      {
        "years": "2000-2026",
        "length": 4400,
        "width": 1900,
        "height": 1300,
        "weight": 2717
      }
    ],
    "Monza": [
      {
        "years": "2000-2026",
        "length": 4400,
        "width": 1900,
        "height": 1300,
        "weight": 2717
      }
    ],
    "2-eleven": [
      {
        "years": "2000-2026",
        "length": 4400,
        "width": 1900,
        "height": 1300,
        "weight": 2717
      }
    ],
    "Turbo Esprit": [
      {
        "years": "2000-2026",
        "length": 4400,
        "width": 1900,
        "height": 1300,
        "weight": 2717
      }
    ],
    "Emira": [
      {
        "years": "2000-2026",
        "length": 4400,
        "width": 1900,
        "height": 1300,
        "weight": 2717
      }
    ]
  },
  "Nio": {
    "Rap / R Antonio’s P": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ]
  },
  "Opel": {
    "Ampera": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Opel": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Sintra": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Ampera-e": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Ampera-e Ev": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Propell": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ]
  },
  "Rolls-Royce": {
    "Phantom": [
      {
        "years": "2000-2026",
        "length": 5400,
        "width": 2000,
        "height": 1500,
        "weight": 3000
      }
    ],
    "Wraith": [
      {
        "years": "2000-2026",
        "length": 5400,
        "width": 2000,
        "height": 1500,
        "weight": 3000
      }
    ],
    "Silver Dawn": [
      {
        "years": "2000-2026",
        "length": 5400,
        "width": 2000,
        "height": 1500,
        "weight": 3000
      }
    ],
    "Silver Spur": [
      {
        "years": "2000-2026",
        "length": 5400,
        "width": 2000,
        "height": 1500,
        "weight": 3000
      }
    ],
    "Silver Spirit": [
      {
        "years": "2000-2026",
        "length": 5400,
        "width": 2000,
        "height": 1500,
        "weight": 3000
      }
    ],
    "Corniche": [
      {
        "years": "2000-2026",
        "length": 5400,
        "width": 2000,
        "height": 1500,
        "weight": 3000
      }
    ],
    "Park Ward": [
      {
        "years": "2000-2026",
        "length": 5400,
        "width": 2000,
        "height": 1500,
        "weight": 3000
      }
    ],
    "Silver Seraph": [
      {
        "years": "2000-2026",
        "length": 5400,
        "width": 2000,
        "height": 1500,
        "weight": 3000
      }
    ],
    "Dawn": [
      {
        "years": "2000-2026",
        "length": 5400,
        "width": 2000,
        "height": 1500,
        "weight": 3000
      }
    ],
    "Camargue": [
      {
        "years": "2000-2026",
        "length": 5400,
        "width": 2000,
        "height": 1500,
        "weight": 3000
      }
    ],
    "Cullinan": [
      {
        "years": "2000-2026",
        "length": 5400,
        "width": 2000,
        "height": 1500,
        "weight": 3000
      }
    ],
    "Flying Spur": [
      {
        "years": "2000-2026",
        "length": 5400,
        "width": 2000,
        "height": 1500,
        "weight": 3000
      }
    ],
    "Spectre": [
      {
        "years": "2000-2026",
        "length": 5400,
        "width": 2000,
        "height": 1500,
        "weight": 3000
      }
    ]
  },
  "Saab": {
    "9-3": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "9-5": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "9-4x": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "9-7x": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "9-2x": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ]
  },
  "Smart": {
    "Open Platform": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ]
  },
  "VinFast": {
    "Vf 8": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Vf 9": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Vf 7": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ],
    "Vf 6": [
      {
        "years": "2000-2026",
        "length": 4200,
        "width": 1750,
        "height": 1450,
        "weight": 2664
      }
    ]
  }
};

async function seedVehicleCatalog() {
  const startTime = Date.now();
  
  const makes = Object.entries(VEHICLE_CATALOG);
  const totalMakes = makes.length;
  let totalModels = 0;
  let totalVariants = 0;

  // Step 1: Sort makes alphabetically and batch insert
  const sortedMakes = makes.sort(([a], [b]) => a.localeCompare(b));
  const makesToCreate = sortedMakes.map(([makeName], index) => ({
    name: makeName,
    isActive: true,
    sortOrder: index,
  }));
  
  await prisma.vehicleMake.createMany({
    data: makesToCreate,
    skipDuplicates: true,
  });
  
  // Fetch all makes to get their IDs
  const dbMakes = await prisma.vehicleMake.findMany();
  const makeIdMap = new Map(dbMakes.map(m => [m.name, m.id]));

  // Step 2: Prepare all models and variants (sorted alphabetically)
  const modelsToCreate = [];
  const variantsToCreate = [];
  let modelIndex = 0;

  for (const [makeName, modelsData] of sortedMakes) {
    const makeId = makeIdMap.get(makeName);
    if (!makeId) continue;

    // Sort models alphabetically for this make
    const sortedModels = Object.entries(modelsData).sort(([a], [b]) => a.localeCompare(b));

    for (const [modelName, modelVariants] of sortedModels) {
      const modelId = `${makeId}_${modelName.replace(/\s+/g, '_')}`;
      modelsToCreate.push({
        id: modelId,
        makeId: makeId,
        name: modelName,
        isActive: true,
        sortOrder: modelIndex++,
      });
      totalModels++;

      for (const variant of modelVariants) {
        const years = variant.years.split("-").map((y) => parseInt(y.trim()));
        const yearStart = years[0];
        const yearEnd = years[1] ?? yearStart;
        variantsToCreate.push({
          id: `${modelId}_${yearStart}_${yearEnd}`,
          modelId: modelId,
          yearStart,
          yearEnd,
          lengthCm: variant.length ? Math.round(variant.length / 10) : null,
          widthCm: variant.width ? Math.round(variant.width / 10) : null,
          heightCm: variant.height ? Math.round(variant.height / 10) : null,
          weightKg: variant.weight !== undefined ? variant.weight : null,
          isActive: true,
        });
        totalVariants++;
      }
    }
  }

  // Step 3: Batch insert all models
  const MODEL_BATCH_SIZE = 500;
  for (let i = 0; i < modelsToCreate.length; i += MODEL_BATCH_SIZE) {
    const batch = modelsToCreate.slice(i, i + MODEL_BATCH_SIZE);
    await prisma.vehicleModel.createMany({
      data: batch,
      skipDuplicates: true,
    });
  }

  // Step 4: Batch upsert all variants (update existing records)
  const VARIANT_BATCH_SIZE = 100;
  for (let i = 0; i < variantsToCreate.length; i += VARIANT_BATCH_SIZE) {
    const batch = variantsToCreate.slice(i, i + VARIANT_BATCH_SIZE);
    for (const variant of batch) {
      await prisma.vehicleModelVariant.upsert({
        where: { id: variant.id },
        update: {
          lengthCm: variant.lengthCm,
          widthCm: variant.widthCm,
          heightCm: variant.heightCm,
          weightKg: variant.weightKg,
        },
        create: variant,
      });
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
}

async function main() {
  const passwordHash = await bcrypt.hash("Parkit123!", 10);

  // Flow: SUPER_ADMIN creates companies via API, picks one in the company selector (x-company-id),
  // and everything created afterward (users, parkings, etc.) is linked to that company.
  // Create or update the system superadmin with complete profile
  const superAdminEmail = process.env.SUPPORT_EMAIL;
  const superAdminPhone = process.env.SUPER_ADMIN_PHONE;
  await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: {
      companyId: null,
      firstName: "Sys",
      lastName: "Admin",
      passwordHash,
      systemRole: "SUPER_ADMIN",
      timezone: "America/Costa_Rica",
      phone: superAdminPhone,
      phoneVerified: true,
      isActive: true,
    },
    create: {
      id: "b8e5d9b5-6g35-5c77-0g95-d6ec1g9f7b12",
      companyId: null,
      firstName: "Sys",
      lastName: "Admin",
      email: superAdminEmail,
      passwordHash,
      systemRole: "SUPER_ADMIN",
      timezone: "America/Costa_Rica",
      phone: superAdminPhone,
      phoneVerified: true,
      isActive: true,
      appPreferences: JSON.stringify({
        language: "es",
        theme: "system",
        notifications: {
          email: true,
          push: true,
          sms: false,
        },
      }),
    },
  });

  // Seed banks and cards
  await seedBanksAndCards();

  // Seed vehicle catalog
  await seedVehicleCatalog();
}

async function seedBanksAndCards() {

  // Banks
  const banks = [
    { code: "BAC_CREDOMATIC", name: "BAC Credomatic", sortOrder: 0 },
    { code: "PROMERICA", name: "Promerica", sortOrder: 1 },
  ];

  await prisma.bank.createMany({
    data: banks,
    skipDuplicates: true,
  });

  // Get bank IDs
  const dbBanks = await prisma.bank.findMany();
  const bankIdMap = new Map(dbBanks.map(b => [b.code, b.id]));
  const bacId = bankIdMap.get("BAC_CREDOMATIC");

  // Bank cards with fees based on user requirements
  // bankId: null = generic/no bank (courtesy, cash payment, corporate benefit)
  const cards = [
    // BAC Credomatic cards
    { bankId: bacId, code: "AMEX_THE_PLATINUM_CARD", name: "American Express The Platinum Card", type: "AMEX", feeCrc: 5000 },
    { bankId: bacId, code: "AMEX_CASHBACK_PREMIUM", name: "American Express Cashback Premium", type: "AMEX", feeCrc: 2500 },
    { bankId: bacId, code: "AMEX_MILLAS_PLUS_BLACK", name: "American Express Millas Plus Black", type: "AMEX", feeCrc: 0 },
    { bankId: bacId, code: "AMEX_PLATINUM", name: "American Express Platinum", type: "AMEX", feeCrc: 2500 },
    { bankId: bacId, code: "AMEX_INCAE", name: "American Express INCAE", type: "AMEX", feeCrc: 5000 },
    { bankId: bacId, code: "AMEX_AADVANTAGE_PRESTIGE", name: "American Express AAdvantage Prestige", type: "AMEX", feeCrc: 5000 },
    { bankId: bacId, code: "AMEX_LIFEMILES_ELITE", name: "American Express LifeMiles Elite", type: "AMEX", feeCrc: 5000 },
    { bankId: bacId, code: "MASTERCARD_BLACK", name: "Mastercard Black", type: "MASTERCARD", feeCrc: 0 },
    { bankId: bacId, code: "MASTERCARD_PLATINUM", name: "Mastercard Platinum", type: "MASTERCARD", feeCrc: 2500 },
    { bankId: bacId, code: "MASTERCARD_BLACK_MILLAS_PLUS", name: "Mastercard Black Millas Plus", type: "MASTERCARD", feeCrc: 0 },
    { bankId: bacId, code: "MASTERCARD_CASHBACK_PREMIUM", name: "Mastercard Cashback Premium", type: "MASTERCARD", feeCrc: 2500 },
    { bankId: bacId, code: "MASTERCARD_BLACK_AADVANTAGE", name: "Mastercard Black AAdvantage", type: "MASTERCARD", feeCrc: 0 },
    { bankId: bacId, code: "VISA_INFINITE", name: "Visa Infinite", type: "VISA", feeCrc: 0 },
    { bankId: bacId, code: "VISA_INFINITE_IBERIA", name: "Visa Infinite Iberia", type: "VISA", feeCrc: 0 },
    { bankId: bacId, code: "VISA_INFINITE_EMERALD", name: "Visa Infinite Emerald", type: "VISA", feeCrc: 0 },
    { bankId: bacId, code: "VISA_INFINITE_CONNECT_MILES", name: "Visa Infinite Connect Miles", type: "VISA", feeCrc: 0 },
    { bankId: bacId, code: "VISA_INFINITE_MILLAS_PLUS", name: "Visa Infinite Millas Plus", type: "VISA", feeCrc: 0 },
    { bankId: bacId, code: "VISA_PLATINO", name: "Visa Platino", type: "VISA", feeCrc: 2500 },
    { bankId: bacId, code: "LINCOLN_PLAZA", name: "Lincoln Plaza", type: "OTHER", feeCrc: 0 },
    { bankId: bacId, code: "CORPORATE_BENEFICIARY", name: "Corporate Beneficiary", type: "OTHER", feeCrc: 0 },
    // No bank required (courtesy, cash payment, etc.)
    { bankId: null, code: "OTHER_PAYMENT", name: "Otras / Pagos", type: "OTHER", feeCrc: 5000 },
    { bankId: null, code: "OTHER_PAYMENT_BLACK", name: "Otras Pago/Black", type: "OTHER", feeCrc: 2500 },
    { bankId: null, code: "COURTESY", name: "Cortesía", type: "OTHER", feeCrc: 0 },
  ];

  // Insert all cards (bankId can be null for generic/courtesy cards)
  await prisma.bankCard.createMany({
    data: cards.map((c, i) => ({ ...c, sortOrder: i })),
    skipDuplicates: true,
  });

}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    await prisma.$disconnect();
    process.exit(1);
  });
