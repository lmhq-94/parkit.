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
// Structure: Make -> Model -> Array of { years, desc, length, width, height }
const VEHICLE_CATALOG = {
  //==================
  //    JAPANESE
  //==================
  Toyota: {
    Agya: [
      { years: "2014-2022", length: 3660, width: 1600, height: 1520 },
      { years: "2023-2026", length: 3760, width: 1665, height: 1505 },
    ],
    Starlet: [
      { years: "1990-1999", length: 3720, width: 1600, height: 1380 },
      { years: "2020-2026", length: 3990, width: 1745, height: 1500 },
    ],
    Raize: [{ years: "2022-2026", length: 4030, width: 1710, height: 1635 }],
    Tercel: [{ years: "1991-1999", length: 4120, width: 1660, height: 1350 }],
    Echo: [{ years: "2000-2005", length: 4150, width: 1660, height: 1510 }],
    "Yaris Cross": [
      { years: "2021-2026", length: 4180, width: 1765, height: 1560 },
    ],
    Probox: [{ years: "2002-2026", length: 4195, width: 1695, height: 1500 }],
    GT86: [{ years: "2012-2021", length: 4240, width: 1775, height: 1285 }],
    GR86: [{ years: "2022-2026", length: 4265, width: 1775, height: 1310 }],
    "Corolla Hatchback": [
      { years: "2019-2026", length: 4370, width: 1790, height: 1435 },
    ],
    Supra: [
      { years: "1993-2002", length: 4514, width: 1811, height: 1265 },
      { years: "2019-2026", length: 4379, width: 1854, height: 1294 },
    ],
    "C-HR": [{ years: "2017-2023", length: 4360, width: 1795, height: 1565 }],
    Avanza: [
      { years: "2012-2021", length: 4190, width: 1660, height: 1695 },
      { years: "2022-2026", length: 4395, width: 1730, height: 1700 },
    ],
    Rush: [{ years: "2018-2026", length: 4435, width: 1695, height: 1705 }],
    "Corolla Cross": [
      { years: "2021-2026", length: 4460, width: 1825, height: 1620 },
    ],
    Celica: [
      { years: "1994-1999", length: 4425, width: 1750, height: 1305 },
      { years: "2000-2006", length: 4335, width: 1735, height: 1310 },
    ],
    Corona: [{ years: "1992-1998", length: 4520, width: 1695, height: 1410 }],
    Rav4: [
      { years: "2001-2005", length: 4245, width: 1735, height: 1680 },
      { years: "2006-2012", length: 4600, width: 1815, height: 1685 },
      { years: "2013-2018", length: 4570, width: 1845, height: 1660 },
      { years: "2019-2026", length: 4600, width: 1855, height: 1685 },
    ],
    Prius: [
      { years: "2016-2022", length: 4575, width: 1760, height: 1470 },
      { years: "2023-2026", length: 4600, width: 1780, height: 1430 },
    ],
    Corolla: [
      { years: "1993-1997", length: 4270, width: 1685, height: 1380 },
      { years: "1998-2002", length: 4315, width: 1690, height: 1385 },
      { years: "2003-2008", length: 4530, width: 1700, height: 1480 },
      { years: "2009-2013", length: 4540, width: 1760, height: 1465 },
      { years: "2014-2019", length: 4620, width: 1775, height: 1460 },
      { years: "2020-2026", length: 4630, width: 1780, height: 1435 },
    ],
    "FJ Cruiser": [
      { years: "2007-2014", length: 4670, width: 1905, height: 1830 },
    ],
    "Prado (3 puertas)": [
      { years: "2003-2009", length: 4330, width: 1875, height: 1865 },
      { years: "2010-2023", length: 4485, width: 1885, height: 1845 },
    ],
    Innova: [
      { years: "2016-2022", length: 4735, width: 1830, height: 1795 },
      { years: "2023-2026", length: 4755, width: 1850, height: 1795 },
    ],
    Fortuner: [
      { years: "2005-2015", length: 4695, width: 1840, height: 1795 },
      { years: "2016-2026", length: 4795, width: 1855, height: 1835 },
    ],
    "4Runner": [
      { years: "1996-2002", length: 4655, width: 1800, height: 1750 },
      { years: "2003-2009", length: 4800, width: 1910, height: 1810 },
      { years: "2010-2024", length: 4820, width: 1925, height: 1780 },
      { years: "2025-2026", length: 4950, width: 1976, height: 1798 },
    ],
    "Prado (5 puertas)": [
      { years: "1996-2002", length: 4730, width: 1820, height: 1880 },
      { years: "2003-2009", length: 4850, width: 1875, height: 1895 },
      { years: "2010-2023", length: 4840, width: 1885, height: 1845 },
      { years: "2024-2026", length: 4925, width: 1980, height: 1870 },
    ],
    Highlander: [
      { years: "2014-2019", length: 4855, width: 1925, height: 1730 },
      { years: "2020-2026", length: 4950, width: 1930, height: 1730 },
    ],
    Camry: [{ years: "2018-2026", length: 4885, width: 1840, height: 1445 }],
    "Land Cruiser 70 (Hardtop)": [
      { years: "1984-2026", length: 4910, width: 1870, height: 1940 },
    ],
    "Land Cruiser 100": [
      { years: "1998-2007", length: 4890, width: 1940, height: 1870 },
    ],
    "Land Cruiser 200": [
      { years: "2008-2021", length: 4950, width: 1980, height: 1900 },
    ],
    "Land Cruiser 300": [
      { years: "2022-2026", length: 4985, width: 1980, height: 1945 },
    ],
    Sienna: [
      { years: "2011-2020", length: 5085, width: 1985, height: 1750 },
      { years: "2021-2026", length: 5175, width: 1995, height: 1740 },
    ],
    Sequoia: [
      { years: "2008-2022", length: 5210, width: 2030, height: 1955 },
      { years: "2023-2026", length: 5286, width: 2022, height: 1885 },
    ],
    "Hilux (Cabina Sencilla)": [
      { years: "1998-2004", length: 4790, width: 1690, height: 1650 },
      { years: "2005-2015", length: 5260, width: 1760, height: 1680 },
      { years: "2016-2026", length: 5330, width: 1800, height: 1690 },
    ],
    "Hilux (Extra Cabina)": [
      { years: "2005-2015", length: 5260, width: 1835, height: 1795 },
      { years: "2016-2026", length: 5330, width: 1855, height: 1810 },
    ],
    "Hilux (Doble Cabina)": [
      { years: "1989-1997", length: 4850, width: 1690, height: 1795 },
      { years: "1998-2004", length: 4980, width: 1690, height: 1750 },
      { years: "2005-2015", length: 5255, width: 1835, height: 1810 },
      { years: "2016-2026", length: 5325, width: 1855, height: 1815 },
    ],
    Tacoma: [
      { years: "2005-2015", length: 5285, width: 1895, height: 1785 },
      { years: "2016-2023", length: 5390, width: 1910, height: 1795 },
      { years: "2024-2026", length: 5410, width: 1950, height: 1890 },
    ],
    Tundra: [
      { years: "2007-2021", length: 5810, width: 2030, height: 1930 },
      { years: "2022-2026", length: 5930, width: 2035, height: 1980 },
    ],
    Hiace: [
      { years: "1990-2004", length: 4690, width: 1690, height: 1980 },
      { years: "2005-2018", length: 5380, width: 1880, height: 2105 },
      { years: "2019-2026", length: 5915, width: 1950, height: 2280 },
    ],
    Coaster: [
      { years: "1993-2016", length: 6990, width: 2080, height: 2635 },
      { years: "2017-2026", length: 7175, width: 2080, height: 2635 },
    ],
  },

  Lexus: {
    LBX: [{ years: "2024-2026", length: 4190, width: 1825, height: 1545 }],
    "CT 200h": [
      { years: "2011-2022", length: 4320, width: 1765, height: 1430 },
    ],
    IS: [
      { years: "2013-2020", length: 4665, width: 1810, height: 1430 },
      { years: "2021-2026", length: 4710, width: 1840, height: 1435 },
    ],
    ES: [{ years: "2018-2026", length: 4975, width: 1865, height: 1445 }],
    LS: [{ years: "2017-2026", length: 5235, width: 1900, height: 1450 }],
    UX: [{ years: "2019-2026", length: 4495, width: 1840, height: 1520 }],
    NX: [
      { years: "2014-2021", length: 4630, width: 1845, height: 1645 },
      { years: "2022-2026", length: 4660, width: 1865, height: 1640 },
    ],
    "RZ (Electric)": [
      { years: "2023-2026", length: 4805, width: 1895, height: 1635 },
    ],
    RX: [
      { years: "2015-2022", length: 4890, width: 1895, height: 1690 },
      { years: "2023-2026", length: 4890, width: 1920, height: 1695 },
    ],
    GX: [
      { years: "2010-2023", length: 4880, width: 1885, height: 1845 },
      { years: "2024-2026", length: 4950, width: 1980, height: 1865 }, // El nuevo GX es mucho más ancho
    ],
    TX: [{ years: "2024-2026", length: 5159, width: 1989, height: 1781 }],
    LX: [
      { years: "2015-2021", length: 5065, width: 1980, height: 1865 },
      { years: "2022-2026", length: 5100, width: 1990, height: 1885 },
    ],
    RC: [{ years: "2014-2026", length: 4700, width: 1840, height: 1395 }],
    LC: [{ years: "2017-2026", length: 4770, width: 1920, height: 1345 }],
    LFA: [{ years: "2011-2012", length: 4505, width: 1895, height: 1220 }],
  },

  Nissan: {
    March: [
      { years: "2011-2020", length: 3780, width: 1665, height: 1530 },
      { years: "2021-2026", length: 3825, width: 1665, height: 1530 },
    ],
    Magnite: [{ years: "2021-2026", length: 3994, width: 1758, height: 1572 }],
    "Versa Note": [
      { years: "2014-2019", length: 4140, width: 1695, height: 1535 },
    ],
    Juke: [
      { years: "2011-2019", length: 4135, width: 1765, height: 1565 },
      { years: "2020-2026", length: 4210, width: 1800, height: 1595 },
    ],
    "Tiida Hatchback": [
      { years: "2004-2012", length: 4205, width: 1695, height: 1535 },
    ],
    Kicks: [
      { years: "2017-2021", length: 4295, width: 1760, height: 1590 },
      { years: "2022-2026", length: 4330, width: 1765, height: 1590 },
    ],
    "Sentra B13": [
      { years: "1991-2017", length: 4325, width: 1640, height: 1380 }, // El  Tsuru
    ],
    Qashqai: [
      { years: "2007-2013", length: 4315, width: 1785, height: 1605 },
      { years: "2014-2021", length: 4370, width: 1800, height: 1595 },
      { years: "2022-2026", length: 4425, width: 1835, height: 1625 },
    ],
    "Tiida Sedan": [
      { years: "2004-2018", length: 4420, width: 1695, height: 1530 },
    ],
    Versa: [
      { years: "2012-2019", length: 4500, width: 1699, height: 1532 },
      { years: "2020-2026", length: 4542, width: 1749, height: 1504 },
    ],
    Sentra: [
      { years: "2000-2006", length: 4510, width: 1710, height: 1410 },
      { years: "2007-2012", length: 4565, width: 1790, height: 1510 },
      { years: "2013-2019", length: 4625, width: 1760, height: 1495 },
      { years: "2020-2026", length: 4645, width: 1815, height: 1445 },
    ],
    "X-Trail": [
      { years: "2001-2007", length: 4455, width: 1765, height: 1700 },
      { years: "2008-2013", length: 4630, width: 1800, height: 1685 },
      { years: "2014-2021", length: 4640, width: 1820, height: 1710 },
      { years: "2022-2026", length: 4680, width: 1840, height: 1720 },
    ],
    Murano: [
      { years: "2003-2008", length: 4770, width: 1880, height: 1705 },
      { years: "2009-2014", length: 4835, width: 1885, height: 1720 },
      { years: "2015-2024", length: 4885, width: 1915, height: 1690 },
    ],
    Pathfinder: [
      { years: "1997-2004", length: 4760, width: 1840, height: 1770 },
      { years: "2005-2012", length: 4850, width: 1850, height: 1780 },
      { years: "2013-2021", length: 5008, width: 1960, height: 1767 },
      { years: "2022-2026", length: 5004, width: 1978, height: 1778 },
    ],
    Patrol: [
      { years: "1998-2009", length: 5050, width: 1930, height: 1855 },
      { years: "2010-2026", length: 5165, width: 1995, height: 1940 },
    ],
    "Frontier (Cabina Sencilla)": [
      { years: "1998-2008", length: 4890, width: 1690, height: 1625 },
      { years: "2009-2015", length: 5120, width: 1770, height: 1720 },
      { years: "2016-2026", length: 5235, width: 1790, height: 1750 },
    ],
    "Frontier (Doble Cabina)": [
      { years: "1998-2004", length: 4980, width: 1690, height: 1650 },
      { years: "2005-2014", length: 5220, width: 1850, height: 1775 },
      { years: "2015-2026", length: 5260, width: 1850, height: 1860 },
    ],
    Navara: [
      { years: "2008-2014", length: 5230, width: 1850, height: 1780 },
      { years: "2015-2026", length: 5330, width: 1850, height: 1840 },
    ],
    Armada: [
      { years: "2004-2015", length: 5275, width: 2000, height: 1960 },
      { years: "2017-2026", length: 5305, width: 2030, height: 1925 },
    ],
    Titan: [
      { years: "2004-2015", length: 5700, width: 2000, height: 1900 },
      { years: "2016-2024", length: 5790, width: 2020, height: 1960 },
    ],
    Urvan: [
      { years: "1999-2012", length: 4695, width: 1695, height: 1975 },
      { years: "2013-2026", length: 5230, width: 1880, height: 2285 },
    ],
  },

  Infiniti: {
    QX30: [{ years: "2016-2019", length: 4425, width: 1815, height: 1515 }],
    "G35 Coupe": [
      { years: "2003-2007", length: 4628, width: 1815, height: 1392 },
    ],
    "G37 Coupe": [
      { years: "2008-2013", length: 4651, width: 1824, height: 1394 },
    ],
    "Q60 Coupe": [
      { years: "2014-2015", length: 4651, width: 1824, height: 1392 },
      { years: "2017-2022", length: 4690, width: 1850, height: 1395 },
    ],
    "G37 Convertible": [
      { years: "2009-2013", length: 4656, width: 1852, height: 1400 },
    ],
    QX50: [
      { years: "2014-2017", length: 4630, width: 1800, height: 1590 },
      { years: "2018-2026", length: 4691, width: 1902, height: 1676 },
    ],
    QX55: [{ years: "2021-2026", length: 4732, width: 1902, height: 1621 }],
    "G35 Sedan": [
      { years: "2003-2006", length: 4732, width: 1750, height: 1465 },
      { years: "2007-2008", length: 4750, width: 1773, height: 1453 },
    ],
    "G37 Sedan": [
      { years: "2009-2013", length: 4750, width: 1773, height: 1453 },
    ],
    Q50: [
      { years: "2014-2024", length: 4790, width: 1820, height: 1445 },
      { years: "2025-2026", length: 4815, width: 1825, height: 1450 },
    ],
    FX35: [
      { years: "2003-2008", length: 4803, width: 1925, height: 1651 },
      { years: "2009-2012", length: 4859, width: 1928, height: 1651 },
    ],
    FX45: [{ years: "2003-2008", length: 4803, width: 1925, height: 1674 }],
    FX37: [{ years: "2013", length: 4859, width: 1928, height: 1651 }],
    FX50: [{ years: "2009-2013", length: 4859, width: 1928, height: 1679 }],
    QX70: [{ years: "2014-2019", length: 4865, width: 1925, height: 1680 }],
    Q70: [{ years: "2014-2019", length: 4945, width: 1845, height: 1500 }],
    QX60: [
      { years: "2013-2021", length: 4990, width: 1960, height: 1745 },
      { years: "2022-2026", length: 5032, width: 1981, height: 1770 },
    ],
    QX80: [
      { years: "2014-2024", length: 5305, width: 2030, height: 1925 },
      { years: "2025-2026", length: 5364, width: 2115, height: 1945 },
    ],
  },

  Honda: {
    Zest: [{ years: "2006-2012", length: 3395, width: 1475, height: 1635 }],
    Brio: [{ years: "2019-2026", length: 3815, width: 1680, height: 1485 }],
    Fit: [
      { years: "2001-2008", length: 3830, width: 1675, height: 1525 },
      { years: "2009-2014", length: 3900, width: 1695, height: 1525 },
      { years: "2015-2020", length: 4065, width: 1700, height: 1525 },
      { years: "2021-2026", length: 3995, width: 1695, height: 1540 },
    ],
    "WR-V": [
      { years: "2017-2022", length: 4000, width: 1735, height: 1600 },
      { years: "2023-2026", length: 4060, width: 1780, height: 1608 },
    ],
    S2000: [{ years: "1999-2009", length: 4120, width: 1750, height: 1285 }],
    "Civic Hatchback": [
      { years: "1992-2000", length: 4180, width: 1695, height: 1375 },
      { years: "2017-2021", length: 4520, width: 1800, height: 1435 },
      { years: "2022-2026", length: 4550, width: 1800, height: 1415 },
    ],
    "HR-V": [
      { years: "1999-2006", length: 4000, width: 1700, height: 1690 },
      { years: "2015-2022", length: 4330, width: 1770, height: 1605 },
      { years: "2023-2026", length: 4567, width: 1840, height: 1620 },
    ],
    Element: [{ years: "2003-2011", length: 4300, width: 1815, height: 1788 }],
    Integra: [
      { years: "1994-2001", length: 4380, width: 1710, height: 1320 },
      { years: "2023-2026", length: 4725, width: 1830, height: 1415 },
    ],
    City: [
      { years: "2003-2008", length: 4390, width: 1690, height: 1485 },
      { years: "2009-2013", length: 4420, width: 1695, height: 1470 },
      { years: "2014-2020", length: 4440, width: 1695, height: 1475 },
      { years: "2021-2026", length: 4553, width: 1748, height: 1467 },
    ],
    "Civic Sedan": [
      { years: "1992-1995", length: 4400, width: 1695, height: 1390 },
      { years: "1996-2000", length: 4450, width: 1705, height: 1390 },
      { years: "2001-2005", length: 4455, width: 1720, height: 1440 },
      { years: "2006-2011", length: 4500, width: 1755, height: 1435 },
      { years: "2012-2015", length: 4525, width: 1755, height: 1435 },
      { years: "2016-2021", length: 4630, width: 1798, height: 1415 },
      { years: "2022-2026", length: 4673, width: 1800, height: 1415 },
    ],
    Prelude: [
      { years: "1992-1996", length: 4440, width: 1765, height: 1290 },
      { years: "1997-2001", length: 4545, width: 1750, height: 1315 },
    ],
    Stream: [
      { years: "2000-2006", length: 4550, width: 1695, height: 1590 },
      { years: "2007-2014", length: 4570, width: 1695, height: 1545 },
    ],
    "CR-V": [
      { years: "1997-2001", length: 4510, width: 1750, height: 1675 },
      { years: "2002-2006", length: 4535, width: 1785, height: 1680 },
      { years: "2007-2011", length: 4520, width: 1820, height: 1675 },
      { years: "2012-2016", length: 4535, width: 1820, height: 1655 },
      { years: "2017-2022", length: 4585, width: 1855, height: 1680 },
      { years: "2023-2026", length: 4705, width: 1865, height: 1680 },
    ],
    Passport: [
      { years: "1994-2002", length: 4675, width: 1785, height: 1750 },
      { years: "2019-2026", length: 4840, width: 1995, height: 1820 },
    ],
    Accord: [
      { years: "1994-1997", length: 4670, width: 1780, height: 1400 },
      { years: "1998-2002", length: 4795, width: 1785, height: 1445 },
      { years: "2003-2007", length: 4850, width: 1820, height: 1455 },
      { years: "2008-2012", length: 4945, width: 1845, height: 1475 },
      { years: "2013-2017", length: 4860, width: 1850, height: 1465 },
      { years: "2018-2022", length: 4880, width: 1860, height: 1450 },
      { years: "2023-2026", length: 4970, width: 1860, height: 1450 },
    ],
    Pilot: [
      { years: "2003-2008", length: 4775, width: 1965, height: 1790 },
      { years: "2009-2015", length: 4850, width: 1995, height: 1845 },
      { years: "2016-2022", length: 4940, width: 1995, height: 1775 },
      { years: "2023-2026", length: 5085, width: 1995, height: 1830 },
    ],
    Odyssey: [
      { years: "1995-2004", length: 4840, width: 1840, height: 1670 },
      { years: "2005-2010", length: 5105, width: 1955, height: 1750 },
      { years: "2011-2017", length: 5155, width: 2010, height: 1735 },
      { years: "2018-2026", length: 5210, width: 1995, height: 1765 },
    ],
    Ridgeline: [
      { years: "2006-2014", length: 5255, width: 1975, height: 1785 },
      { years: "2017-2026", length: 5335, width: 1995, height: 1795 },
    ],
  },

  Acura: {
    RSX: [{ years: "2002-2006", length: 4374, width: 1725, height: 1394 }],
    NSX: [
      { years: "1991-2005", length: 4404, width: 1811, height: 1171 },
      { years: "2017-2022", length: 4470, width: 1938, height: 1214 },
    ],
    RDX: [
      { years: "2007-2012", length: 4590, width: 1872, height: 1656 },
      { years: "2013-2018", length: 4684, width: 1872, height: 1651 },
      { years: "2019-2026", length: 4760, width: 1900, height: 1669 },
    ],
    ILX: [{ years: "2013-2022", length: 4620, width: 1793, height: 1412 }],
    TSX: [
      { years: "2004-2008", length: 4656, width: 1763, height: 1455 },
      { years: "2009-2014", length: 4724, width: 1842, height: 1440 },
    ],
    ADX: [{ years: "2025-2026", length: 4719, width: 1841, height: 1621 }],
    Integra: [{ years: "2023-2026", length: 4719, width: 1829, height: 1410 }],
    TL: [
      { years: "2004-2008", length: 4808, width: 1834, height: 1440 },
      { years: "2009-2014", length: 4925, width: 1880, height: 1453 },
    ],
    TLX: [
      { years: "2015-2020", length: 4831, width: 1854, height: 1448 },
      { years: "2021-2026", length: 4943, width: 1910, height: 1433 },
    ],
    ZDX: [
      { years: "2010-2013", length: 4887, width: 1994, height: 1595 },
      { years: "2024-2026", length: 5022, width: 1956, height: 1636 },
    ],
    MDX: [
      { years: "2007-2013", length: 4844, width: 1994, height: 1732 },
      { years: "2014-2020", length: 4917, width: 1961, height: 1717 },
      { years: "2022-2026", length: 5039, width: 1999, height: 1725 },
    ],
    RLX: [{ years: "2014-2020", length: 4981, width: 1890, height: 1466 }],
  },

  Mazda: {
    Demio: [
      { years: "1996-2002", length: 3800, width: 1670, height: 1535 },
      { years: "2003-2007", length: 3925, width: 1680, height: 1530 },
    ],
    "MX-5 Miata": [
      { years: "1990-1997", length: 3970, width: 1675, height: 1230 },
      { years: "1999-2005", length: 3945, width: 1680, height: 1225 },
      { years: "2006-2015", length: 4000, width: 1720, height: 1245 },
      { years: "2016-2026", length: 3915, width: 1735, height: 1230 },
    ],
    "Mazda 2 Hatchback": [
      { years: "2008-2014", length: 3900, width: 1695, height: 1475 },
      { years: "2015-2026", length: 4060, width: 1695, height: 1495 },
    ],
    "CX-3": [{ years: "2015-2022", length: 4275, width: 1765, height: 1535 }],
    "Mazda 2 Sedan": [
      { years: "2011-2014", length: 4270, width: 1695, height: 1475 },
      { years: "2015-2026", length: 4340, width: 1695, height: 1470 },
    ],
    "Protegé / Allegro": [
      { years: "1995-1998", length: 4340, width: 1695, height: 1420 },
      { years: "1999-2003", length: 4420, width: 1705, height: 1410 },
    ],
    "Mazda 3 Hatchback": [
      { years: "2004-2009", length: 4420, width: 1755, height: 1465 },
      { years: "2010-2013", length: 4460, width: 1755, height: 1470 },
      { years: "2014-2018", length: 4460, width: 1795, height: 1450 },
      { years: "2019-2026", length: 4460, width: 1795, height: 1435 },
    ],
    "CX-30": [{ years: "2020-2026", length: 4395, width: 1795, height: 1540 }],
    "MX-30": [{ years: "2020-2026", length: 4395, width: 1795, height: 1555 }],
    "CX-5": [
      { years: "2013-2017", length: 4555, width: 1840, height: 1670 },
      { years: "2017-2026", length: 4550, width: 1842, height: 1680 },
    ],
    "Mazda 3 Sedan": [
      { years: "2004-2009", length: 4510, width: 1755, height: 1465 },
      { years: "2010-2013", length: 4580, width: 1755, height: 1470 },
      { years: "2014-2018", length: 4580, width: 1795, height: 1450 },
      { years: "2019-2026", length: 4660, width: 1797, height: 1440 },
    ],
    "CX-7": [{ years: "2007-2012", length: 4675, width: 1870, height: 1645 }],
    "Mazda 5": [
      { years: "2006-2010", length: 4505, width: 1755, height: 1615 },
      { years: "2012-2015", length: 4585, width: 1750, height: 1615 },
    ],
    "Mazda 6": [
      { years: "2003-2008", length: 4670, width: 1780, height: 1435 },
      { years: "2009-2012", length: 4735, width: 1795, height: 1440 },
      { years: "2014-2024", length: 4865, width: 1840, height: 1450 },
    ],
    "CX-50": [{ years: "2023-2026", length: 4725, width: 1920, height: 1645 }],
    "CX-60": [{ years: "2023-2026", length: 4745, width: 1890, height: 1680 }],
    "B-Series (Cabina Sencilla)": [
      { years: "1986-1997", length: 4720, width: 1670, height: 1590 },
      { years: "1998-2006", length: 4850, width: 1750, height: 1620 },
    ],
    "B-Series (Doble Cabina)": [
      { years: "1998-2006", length: 4980, width: 1750, height: 1700 },
    ],
    "CX-8": [{ years: "2017-2024", length: 4900, width: 1840, height: 1730 }],
    "CX-9": [
      { years: "2007-2015", length: 5075, width: 1955, height: 1745 },
      { years: "2016-2023", length: 5065, width: 1969, height: 1747 },
    ],
    "CX-90": [{ years: "2024-2026", length: 5120, width: 1994, height: 1732 }],
    "BT-50 (Cabina Sencilla)": [
      { years: "2007-2011", length: 5075, width: 1715, height: 1630 },
      { years: "2021-2026", length: 5325, width: 1810, height: 1710 },
    ],
    "BT-50 (Doble Cabina)": [
      { years: "2007-2011", length: 5085, width: 1770, height: 1760 },
      { years: "2012-2020", length: 5275, width: 1850, height: 1795 },
      { years: "2021-2026", length: 5285, width: 1865, height: 1850 },
    ],
  },

  Suzuki: {
    "Super Carry (Camioncito)": [
      { years: "1985-2026", length: 3240, width: 1395, height: 1765 },
    ],
    Samurai: [{ years: "1985-1995", length: 3430, width: 1540, height: 1665 }],
    Alto: [
      { years: "2009-2014", length: 3495, width: 1475, height: 1460 },
      { years: "2015-2026", length: 3445, width: 1490, height: 1475 },
    ],
    "S-Presso": [
      { years: "2020-2026", length: 3565, width: 1520, height: 1565 },
    ],
    Celerio: [
      { years: "2014-2021", length: 3600, width: 1600, height: 1540 },
      { years: "2022-2026", length: 3695, width: 1655, height: 1555 },
    ],
    "Jimny (3 puertas)": [
      { years: "1998-2018", length: 3625, width: 1600, height: 1670 },
      { years: "2019-2026", length: 3645, width: 1645, height: 1720 },
    ],
    "Sidekick (3 puertas)": [
      { years: "1989-1998", length: 3620, width: 1630, height: 1665 },
    ],
    Ignis: [{ years: "2017-2024", length: 3700, width: 1660, height: 1595 }],
    Swift: [
      { years: "1989-2004", length: 3710, width: 1590, height: 1350 },
      { years: "2005-2010", length: 3695, width: 1690, height: 1500 },
      { years: "2011-2017", length: 3850, width: 1695, height: 1510 },
      { years: "2018-2026", length: 3845, width: 1735, height: 1495 },
    ],
    "Baleno Hatchback": [
      { years: "2016-2026", length: 3990, width: 1745, height: 1500 },
    ],
    "Jimny (5 puertas)": [
      { years: "2023-2026", length: 3985, width: 1645, height: 1720 },
    ],
    Fronx: [{ years: "2023-2026", length: 3995, width: 1765, height: 1550 }],
    Dzire: [{ years: "2017-2026", length: 3995, width: 1735, height: 1515 }],
    "Vitara (3 puertas)": [
      { years: "1998-2005", length: 3880, width: 1695, height: 1685 },
    ],
    "Vitara (5 puertas)": [
      { years: "1998-2005", length: 4025, width: 1780, height: 1755 },
      { years: "2015-2022", length: 4175, width: 1775, height: 1610 },
      { years: "2023-2026", length: 4228, width: 1790, height: 1610 },
    ],
    "Sidekick (5 puertas)": [
      { years: "1991-1998", length: 4125, width: 1695, height: 1695 },
    ],
    "SX4 Hatchback": [
      { years: "2007-2014", length: 4135, width: 1755, height: 1620 },
    ],
    "SX4 Sedan": [
      { years: "2007-2014", length: 4490, width: 1730, height: 1545 },
    ],
    "S-Cross": [
      { years: "2014-2021", length: 4300, width: 1765, height: 1575 },
      { years: "2022-2026", length: 4300, width: 1785, height: 1580 },
    ],
    APV: [{ years: "2005-2026", length: 4230, width: 1655, height: 1860 }],
    Ertiga: [
      { years: "2012-2018", length: 4265, width: 1695, height: 1685 },
      { years: "2019-2026", length: 4395, width: 1735, height: 1690 },
    ],
    "Grand Vitara (3 puertas)": [
      { years: "2006-2014", length: 4005, width: 1810, height: 1695 },
    ],
    "Grand Vitara (5 puertas)": [
      { years: "1998-2005", length: 4195, width: 1780, height: 1740 },
      { years: "2006-2014", length: 4500, width: 1810, height: 1695 },
      { years: "2023-2026", length: 4375, width: 1795, height: 1645 },
    ],
    Ciaz: [{ years: "2015-2024", length: 4490, width: 1730, height: 1485 }],
    XL7: [{ years: "2020-2026", length: 4450, width: 1775, height: 1710 }],
  },

  Mitsubishi: {
    "i-MiEV": [{ years: "2010-2021", length: 3475, width: 1475, height: 1610 }],
    "Montero iO (3 puertas)": [
      { years: "1998-2007", length: 3675, width: 1680, height: 1700 },
    ],
    "Space Star": [
      { years: "2013-2026", length: 3710, width: 1665, height: 1490 },
    ],
    "Mirage Hatchback": [
      { years: "2013-2026", length: 3845, width: 1665, height: 1510 },
    ],
    Colt: [{ years: "2004-2012", length: 3871, width: 1699, height: 1550 }],
    "Montero iO (5 puertas)": [
      { years: "1998-2007", length: 3975, width: 1680, height: 1700 },
    ],
    "Pajero / Montero (3 puertas)": [
      { years: "1991-2000", length: 4030, width: 1695, height: 1845 },
      { years: "2001-2006", length: 4220, width: 1875, height: 1845 },
      { years: "2007-2021", length: 4385, width: 1875, height: 1850 },
    ],
    ASX: [
      { years: "2010-2019", length: 4295, width: 1770, height: 1625 },
      { years: "2020-2026", length: 4370, width: 1800, height: 1630 },
    ],
    "Mirage G4 (Sedan)": [
      { years: "2014-2026", length: 4305, width: 1670, height: 1515 },
    ],
    "Eclipse (Coupe)": [
      { years: "1995-1999", length: 4380, width: 1745, height: 1295 },
      { years: "2000-2005", length: 4488, width: 1750, height: 1310 },
      { years: "2006-2012", length: 4565, width: 1835, height: 1358 },
    ],
    Xforce: [{ years: "2024-2026", length: 4390, width: 1810, height: 1660 }],
    "Eclipse Cross": [
      { years: "2018-2021", length: 4405, width: 1805, height: 1685 },
      { years: "2022-2026", length: 4545, width: 1805, height: 1685 },
    ],
    Lancer: [
      { years: "1992-1996", length: 4275, width: 1690, height: 1385 },
      { years: "1997-2001", length: 4410, width: 1690, height: 1390 },
      { years: "2002-2007", length: 4495, width: 1695, height: 1375 },
      { years: "2008-2017", length: 4570, width: 1760, height: 1490 },
    ],
    "Lancer Evolution": [
      { years: "1998-2006", length: 4455, width: 1770, height: 1450 },
      { years: "2008-2016", length: 4505, width: 1810, height: 1480 },
    ],
    Outlander: [
      { years: "2003-2006", length: 4475, width: 1750, height: 1620 },
      { years: "2007-2012", length: 4640, width: 1800, height: 1680 },
      { years: "2013-2021", length: 4695, width: 1800, height: 1710 },
      { years: "2022-2026", length: 4710, width: 1862, height: 1745 },
    ],
    "3000GT": [{ years: "1990-2000", length: 4580, width: 1840, height: 1285 }],
    Xpander: [
      { years: "2018-2021", length: 4475, width: 1750, height: 1700 },
      { years: "2022-2026", length: 4595, width: 1750, height: 1750 },
    ],
    "Montero Sport": [
      { years: "1997-2008", length: 4610, width: 1775, height: 1735 },
      { years: "2009-2015", length: 4695, width: 1815, height: 1800 },
      { years: "2016-2026", length: 4825, width: 1815, height: 1835 },
    ],
    Galant: [
      { years: "1996-2003", length: 4630, width: 1740, height: 1420 },
      { years: "2004-2012", length: 4840, width: 1840, height: 1470 },
    ],
    Grandis: [{ years: "2003-2011", length: 4765, width: 1795, height: 1655 }],
    Endeavor: [{ years: "2004-2011", length: 4846, width: 1870, height: 1768 }],
    "Montero / Pajero (5 puertas)": [
      { years: "1991-2000", length: 4725, width: 1775, height: 1900 },
      { years: "2001-2006", length: 4830, width: 1895, height: 1885 },
      { years: "2007-2021", length: 4900, width: 1875, height: 1870 },
    ],
    "L200 (Cabina Sencilla)": [
      { years: "1996-2005", length: 4920, width: 1695, height: 1710 },
      { years: "2006-2014", length: 5040, width: 1750, height: 1775 },
      { years: "2015-2026", length: 5270, width: 1815, height: 1780 },
    ],
    "L200 (Doble Cabina)": [
      { years: "1996-2005", length: 5000, width: 1695, height: 1800 },
      { years: "2006-2014", length: 5115, width: 1750, height: 1775 },
      { years: "2015-2023", length: 5225, width: 1815, height: 1775 },
      { years: "2024-2026", length: 5360, width: 1930, height: 1820 },
    ],
    Rosa: [{ years: "1990-2026", length: 6990, width: 2065, height: 2720 }],
  },

  Subaru: {
    Vivio: [{ years: "1992-1998", length: 3295, width: 1395, height: 1375 }],
    Rex: [
      { years: "1987-1992", length: 3295, width: 1395, height: 1400 },
      { years: "2023-2026", length: 3995, width: 1695, height: 1620 },
    ],
    Justy: [
      { years: "1984-1994", length: 3535, width: 1535, height: 1390 },
      { years: "1995-2003", length: 3745, width: 1590, height: 1380 },
      { years: "2007-2011", length: 3610, width: 1665, height: 1540 },
    ],
    BRZ: [
      { years: "2012-2021", length: 4240, width: 1775, height: 1285 },
      { years: "2022-2026", length: 4265, width: 1775, height: 1310 },
    ],
    "Impreza Hatchback": [
      { years: "1993-2000", length: 4350, width: 1690, height: 1440 },
      { years: "2001-2007", length: 4415, width: 1740, height: 1475 },
      { years: "2008-2011", length: 4415, width: 1740, height: 1475 },
      { years: "2012-2016", length: 4415, width: 1740, height: 1465 },
      { years: "2017-2023", length: 4460, width: 1775, height: 1480 },
      { years: "2024-2026", length: 4470, width: 1780, height: 1480 },
    ],
    "Impreza Sedan": [
      { years: "1993-2000", length: 4375, width: 1690, height: 1410 },
      { years: "2001-2007", length: 4415, width: 1740, height: 1440 },
      { years: "2008-2011", length: 4580, width: 1740, height: 1475 },
      { years: "2012-2016", length: 4580, width: 1740, height: 1465 },
      { years: "2017-2023", length: 4625, width: 1775, height: 1455 },
    ],
    XV: [
      { years: "2012-2017", length: 4450, width: 1800, height: 1615 },
      { years: "2018-2023", length: 4465, width: 1800, height: 1615 },
    ],
    Crosstrek: [
      { years: "2012-2023", length: 4465, width: 1800, height: 1615 }, // Usado para modelos rebadged
      { years: "2024-2026", length: 4480, width: 1800, height: 1620 },
    ],
    Loyale: [{ years: "1984-1994", length: 4370, width: 1660, height: 1430 }],
    WRX: [
      { years: "2014-2021", length: 4595, width: 1795, height: 1475 },
      { years: "2022-2026", length: 4670, width: 1825, height: 1465 },
    ],
    STI: [{ years: "2004-2021", length: 4605, width: 1795, height: 1475 }],
    Forester: [
      { years: "1998-2002", length: 4450, width: 1735, height: 1590 },
      { years: "2003-2008", length: 4485, width: 1735, height: 1590 },
      { years: "2009-2013", length: 4560, width: 1780, height: 1710 },
      { years: "2014-2018", length: 4595, width: 1795, height: 1715 },
      { years: "2019-2026", length: 4625, width: 1815, height: 1730 },
    ],
    Solterra: [{ years: "2023-2026", length: 4690, width: 1860, height: 1650 }],
    "Legacy Sedan": [
      { years: "1990-2003", length: 4605, width: 1695, height: 1410 },
      { years: "2004-2009", length: 4665, width: 1730, height: 1430 },
      { years: "2010-2014", length: 4730, width: 1780, height: 1500 },
      { years: "2015-2019", length: 4790, width: 1840, height: 1500 },
      { years: "2020-2026", length: 4840, width: 1840, height: 1500 },
    ],
    "Legacy Station Wagon": [
      { years: "1990-2003", length: 4680, width: 1695, height: 1470 },
      { years: "2004-2009", length: 4795, width: 1730, height: 1475 },
    ],
    Outback: [
      { years: "1995-2004", length: 4720, width: 1745, height: 1580 },
      { years: "2005-2009", length: 4730, width: 1770, height: 1605 },
      { years: "2010-2014", length: 4800, width: 1820, height: 1670 },
      { years: "2015-2019", length: 4815, width: 1840, height: 1670 },
      { years: "2020-2026", length: 4870, width: 1875, height: 1675 },
    ],
    Baja: [{ years: "2003-2006", length: 4910, width: 1780, height: 1630 }],
    Tribeca: [{ years: "2006-2014", length: 4865, width: 1880, height: 1685 }],
    Ascent: [{ years: "2019-2026", length: 4998, width: 1930, height: 1819 }],
    Evoltis: [{ years: "2019-2026", length: 4998, width: 1930, height: 1819 }],
  },

  Isuzu: {
    Rodeo: [{ years: "1998-2004", length: 4509, width: 1788, height: 1745 }],
    Trooper: [{ years: "1992-2002", length: 4795, width: 1835, height: 1840 }],
    "MU-X": [
      { years: "2013-2020", length: 4825, width: 1860, height: 1825 },
      { years: "2021-2026", length: 4850, width: 1870, height: 1815 },
    ],
    "D-Max": [
      { years: "2002-2011", length: 4900, width: 1720, height: 1735 },
      { years: "2012-2019", length: 5295, width: 1860, height: 1795 },
      { years: "2020-2026", length: 5285, width: 1870, height: 1810 },
    ],
  },

  //==================
  //    KOREAN
  //==================
  Hyundai: {
    Atos: [
      { years: "2000-2013", length: 3495, width: 1495, height: 1580 },
      { years: "2019-2023", length: 3610, width: 1645, height: 1560 },
    ],
    Eon: [{ years: "2012-2019", length: 3495, width: 1550, height: 1500 }],
    "Grand i10 Hatchback": [
      { years: "2014-2019", length: 3765, width: 1660, height: 1520 },
      { years: "2020-2026", length: 3815, width: 1680, height: 1510 },
    ],
    "Grand i10 Sedan": [
      { years: "2014-2019", length: 3995, width: 1660, height: 1520 },
      { years: "2020-2026", length: 3995, width: 1680, height: 1510 },
    ],
    Inster: [{ years: "2024-2026", length: 3825, width: 1610, height: 1575 }],
    Getz: [{ years: "2002-2011", length: 3825, width: 1665, height: 1490 }],
    "HB20 Hatchback": [
      { years: "2020-2022", length: 3940, width: 1720, height: 1470 },
      { years: "2023-2026", length: 4015, width: 1720, height: 1470 },
    ],
    "HB20S (Sedan)": [
      { years: "2020-2022", length: 4260, width: 1720, height: 1470 },
      { years: "2023-2026", length: 4325, width: 1720, height: 1470 },
    ],
    i20: [
      { years: "2015-2020", length: 3985, width: 1734, height: 1485 },
      { years: "2021-2026", length: 4040, width: 1775, height: 1450 },
    ],
    "i20 Active": [
      { years: "2016-2021", length: 3995, width: 1760, height: 1555 },
    ],
    Venue: [{ years: "2020-2026", length: 4040, width: 1770, height: 1590 }],
    Excel: [{ years: "1990-1994", length: 4275, width: 1605, height: 1365 }],
    "Accent Hatchback": [
      { years: "1995-1999", length: 4100, width: 1620, height: 1395 },
      { years: "2000-2005", length: 4200, width: 1670, height: 1395 },
      { years: "2006-2010", length: 4045, width: 1695, height: 1470 },
      { years: "2011-2017", length: 4115, width: 1700, height: 1450 },
    ],
    "Accent Sedan": [
      { years: "1995-1999", length: 4115, width: 1620, height: 1395 },
      { years: "2000-2005", length: 4235, width: 1670, height: 1395 },
      { years: "2006-2010", length: 4280, width: 1695, height: 1470 },
      { years: "2011-2017", length: 4370, width: 1700, height: 1450 },
      { years: "2018-2022", length: 4385, width: 1729, height: 1460 },
      { years: "2023-2026", length: 4535, width: 1765, height: 1475 },
    ],
    Verna: [{ years: "2000-2005", length: 4235, width: 1670, height: 1395 }],
    Veloster: [
      { years: "2011-2017", length: 4220, width: 1790, height: 1399 },
      { years: "2018-2022", length: 4240, width: 1800, height: 1400 },
    ],
    Kona: [
      { years: "2018-2022", length: 4165, width: 1800, height: 1550 },
      { years: "2023-2026", length: 4350, width: 1825, height: 1570 },
    ],
    Creta: [
      { years: "2016-2020", length: 4270, width: 1790, height: 1635 },
      { years: "2021-2026", length: 4300, width: 1790, height: 1635 },
    ],
    i30: [
      { years: "2007-2011", length: 4245, width: 1775, height: 1480 },
      { years: "2012-2016", length: 4300, width: 1780, height: 1470 },
      { years: "2017-2024", length: 4340, width: 1795, height: 1455 },
    ],
    Tucson: [
      { years: "2005-2009", length: 4325, width: 1795, height: 1730 },
      { years: "2010-2015", length: 4410, width: 1820, height: 1655 },
      { years: "2016-2020", length: 4475, width: 1850, height: 1645 },
      { years: "2021-2026", length: 4500, width: 1865, height: 1650 },
    ],
    ix35: [{ years: "2010-2015", length: 4410, width: 1820, height: 1655 }],
    "Creta Grand": [
      { years: "2022-2026", length: 4500, width: 1790, height: 1675 },
    ],
    Galloper: [
      { years: "1991-2003", length: 4035, width: 1680, height: 1840 }, // Corto
      { years: "1991-2003", length: 4635, width: 1680, height: 1840 }, // Largo
    ],
    "Elantra Hatchback / GT": [
      { years: "2001-2006", length: 4520, width: 1720, height: 1425 },
      { years: "2013-2017", length: 4300, width: 1780, height: 1470 },
    ],
    "Elantra Sedan": [
      { years: "1991-1995", length: 4375, width: 1675, height: 1395 },
      { years: "1996-2000", length: 4420, width: 1700, height: 1395 },
      { years: "2001-2006", length: 4520, width: 1720, height: 1425 },
      { years: "2007-2010", length: 4505, width: 1775, height: 1480 },
      { years: "2011-2015", length: 4560, width: 1775, height: 1440 },
      { years: "2016-2020", length: 4570, width: 1800, height: 1450 },
      { years: "2021-2026", length: 4680, width: 1825, height: 1415 },
    ],
    Avante: [{ years: "2011-2026", length: 4680, width: 1825, height: 1415 }],
    "Ioniq Hatchback": [
      { years: "2017-2022", length: 4470, width: 1820, height: 1450 },
    ],
    "Ioniq 5": [
      { years: "2022-2026", length: 4635, width: 1890, height: 1605 },
    ],
    "Ioniq 6": [
      { years: "2023-2026", length: 4855, width: 1880, height: 1495 },
    ],
    Terracan: [{ years: "2001-2007", length: 4710, width: 1860, height: 1795 }],
    "Santa Fe": [
      { years: "2001-2006", length: 4500, width: 1820, height: 1675 },
      { years: "2007-2012", length: 4675, width: 1890, height: 1725 },
      { years: "2013-2018", length: 4690, width: 1880, height: 1680 },
      { years: "2019-2023", length: 4770, width: 1890, height: 1680 },
      { years: "2024-2026", length: 4830, width: 1900, height: 1720 },
    ],
    Palisade: [{ years: "2020-2026", length: 4980, width: 1975, height: 1750 }],
    "Grand Starex / H1": [
      { years: "1997-2007", length: 4695, width: 1820, height: 1880 },
      { years: "2008-2021", length: 5125, width: 1920, height: 1925 },
    ],
    Staria: [{ years: "2022-2026", length: 5253, width: 1997, height: 1990 }],
    County: [{ years: "2000-2026", length: 6460, width: 2080, height: 2600 }],
  },

  Kia: {
    Pride: [{ years: "1987-2000", length: 3565, width: 1605, height: 1460 }],
    Picanto: [
      { years: "2004-2011", length: 3495, width: 1595, height: 1480 },
      { years: "2012-2017", length: 3595, width: 1595, height: 1490 },
      { years: "2018-2026", length: 3595, width: 1595, height: 1485 },
    ],
    Ray: [{ years: "2011-2026", length: 3595, width: 1595, height: 1700 }],
    Sonet: [{ years: "2021-2026", length: 4110, width: 1790, height: 1610 }],
    "Rio Hatchback": [
      { years: "2000-2005", length: 4215, width: 1675, height: 1440 },
      { years: "2006-2011", length: 3990, width: 1695, height: 1470 },
      { years: "2012-2016", length: 4045, width: 1720, height: 1455 },
      { years: "2017-2023", length: 4065, width: 1725, height: 1450 },
    ],
    "Rio Sedan": [
      { years: "2000-2005", length: 4240, width: 1675, height: 1440 },
      { years: "2006-2011", length: 4240, width: 1695, height: 1470 },
      { years: "2012-2016", length: 4365, width: 1720, height: 1455 },
      { years: "2017-2023", length: 4385, width: 1725, height: 1460 },
    ],
    Stonic: [{ years: "2017-2026", length: 4140, width: 1760, height: 1520 }],
    Soul: [
      { years: "2009-2013", length: 4105, width: 1785, height: 1610 },
      { years: "2014-2019", length: 4140, width: 1800, height: 1600 },
      { years: "2020-2026", length: 4195, width: 1800, height: 1600 },
    ],
    Soluto: [{ years: "2019-2026", length: 4300, width: 1700, height: 1460 }],
    Sephia: [{ years: "1992-2003", length: 4360, width: 1695, height: 1390 }],
    Seltos: [
      { years: "2020-2023", length: 4315, width: 1800, height: 1620 },
      { years: "2024-2026", length: 4365, width: 1800, height: 1630 },
    ],
    Niro: [
      { years: "2017-2022", length: 4355, width: 1805, height: 1545 },
      { years: "2023-2026", length: 4420, width: 1825, height: 1545 },
    ],
    Carens: [
      { years: "2006-2012", length: 4545, width: 1820, height: 1650 },
      { years: "2013-2019", length: 4525, width: 1805, height: 1610 },
      { years: "2022-2026", length: 4540, width: 1800, height: 1700 },
    ],
    Rondo: [
      { years: "2006-2012", length: 4545, width: 1820, height: 1650 },
      { years: "2013-2019", length: 4525, width: 1805, height: 1610 },
    ],
    "Cerato Hatchback": [
      { years: "2004-2024", length: 4510, width: 1800, height: 1445 },
    ],
    "Cerato Sedan": [
      { years: "2004-2024", length: 4640, width: 1800, height: 1440 },
    ],
    "Cerato Pro": [
      { years: "2013-2018", length: 4560, width: 1780, height: 1445 },
      { years: "2019-2024", length: 4640, width: 1800, height: 1440 },
    ],
    Forte: [{ years: "2009-2024", length: 4640, width: 1800, height: 1435 }],
    "K3 Sedan": [
      { years: "2024-2026", length: 4545, width: 1765, height: 1475 },
    ],
    "K3 Hatchback": [
      { years: "2024-2026", length: 4295, width: 1765, height: 1495 },
    ],
    Sportage: [{ years: "1993-2026", length: 4660, width: 1865, height: 1660 }],
    EV6: [{ years: "2022-2026", length: 4680, width: 1880, height: 1550 }],
    Sorento: [{ years: "2002-2026", length: 4810, width: 1900, height: 1700 }],
    Stinger: [{ years: "2018-2023", length: 4830, width: 1870, height: 1400 }],
    Optima: [{ years: "2001-2020", length: 4855, width: 1860, height: 1465 }],
    K5: [{ years: "2021-2026", length: 4905, width: 1860, height: 1445 }],
    Telluride: [
      { years: "2020-2026", length: 5000, width: 1990, height: 1750 },
    ],
    EV9: [{ years: "2024-2026", length: 5010, width: 1980, height: 1755 }],
    Mohave: [{ years: "2008-2024", length: 4880, width: 1915, height: 1810 }],
    Carnival: [{ years: "2006-2026", length: 5155, width: 1995, height: 1740 }],
    "Grand Carnival": [
      { years: "2006-2020", length: 5115, width: 1985, height: 1755 },
    ],
    K2700: [{ years: "2005-2026", length: 4820, width: 1740, height: 1995 }],
    Bongo: [{ years: "2005-2026", length: 4820, width: 1740, height: 1995 }],
  },

  SsangYong: {
    Tivoli: [
      { years: "2015-2023", length: 4202, width: 1798, height: 1590 },
      { years: "2024-2026", length: 4225, width: 1810, height: 1613 },
    ],
    Korando: [
      { years: "2010-2018", length: 4410, width: 1830, height: 1675 },
      { years: "2019-2026", length: 4450, width: 1870, height: 1620 },
    ],
    Torres: [{ years: "2023-2026", length: 4700, width: 1890, height: 1720 }],
    Kyron: [{ years: "2005-2014", length: 4660, width: 1880, height: 1740 }],
    "Actyon Sports": [
      { years: "2006-2011", length: 4965, width: 1900, height: 1755 },
      { years: "2012-2018", length: 4990, width: 1910, height: 1790 },
    ],
    Rexton: [
      { years: "2001-2016", length: 4720, width: 1870, height: 1830 },
      { years: "2017-2026", length: 4850, width: 1960, height: 1825 },
    ],
    Musso: [{ years: "2018-2026", length: 5095, width: 1950, height: 1840 }],
    "Musso Grand": [
      { years: "2019-2026", length: 5405, width: 1950, height: 1885 }, // Uno de los pickups más largos del mercado
    ],
  },

  Daewoo: {
    Matiz: [{ years: "1998-2005", length: 3495, width: 1495, height: 1485 }],
    Lanos: [{ years: "1997-2002", length: 4074, width: 1678, height: 1432 }],
    Nubira: [{ years: "1997-2002", length: 4248, width: 1699, height: 1425 }],
    Cielo: [{ years: "1994-1997", length: 4256, width: 1662, height: 1393 }],
    Tacuma: [{ years: "2000-2008", length: 4350, width: 1755, height: 1580 }],
    Leganza: [{ years: "1997-2002", length: 4671, width: 1779, height: 1437 }],
  },

  Genesis: {
    GV60: [{ years: "2022-2026", length: 4515, width: 1890, height: 1580 }],
    G70: [{ years: "2017-2026", length: 4685, width: 1850, height: 1400 }],
    GV70: [{ years: "2021-2026", length: 4715, width: 1910, height: 1630 }],
    G80: [
      { years: "2016-2020", length: 4990, width: 1890, height: 1480 },
      { years: "2021-2026", length: 4995, width: 1925, height: 1465 },
    ],
    GV80: [{ years: "2020-2026", length: 4945, width: 1975, height: 1715 }],
    G90: [
      { years: "2016-2021", length: 5205, width: 1915, height: 1495 },
      { years: "2022-2026", length: 5275, width: 1930, height: 1490 },
    ],
  },

  //==================
  //    EUROPEAN
  //==================
  Volkswagen: {
    "Up!": [{ years: "2014-2021", length: 3605, width: 1645, height: 1500 }],
    Fox: [{ years: "2004-2021", length: 3823, width: 1640, height: 1544 }],
    CrossFox: [{ years: "2005-2021", length: 4034, width: 1677, height: 1600 }],
    "Gol Hatchback": [
      { years: "1994-1999", length: 3890, width: 1640, height: 1415 },
      { years: "2000-2008", length: 3915, width: 1645, height: 1415 },
      { years: "2009-2023", length: 3892, width: 1656, height: 1464 },
    ],
    "Polo Hatchback": [
      { years: "2002-2009", length: 3915, width: 1650, height: 1465 },
      { years: "2010-2017", length: 3970, width: 1682, height: 1462 },
      { years: "2018-2026", length: 4074, width: 1751, height: 1451 },
    ],
    "Polo Sedan": [
      { years: "2003-2022", length: 4390, width: 1699, height: 1467 },
    ],
    "New Beetle": [
      { years: "1998-2011", length: 4129, width: 1721, height: 1498 },
    ],
    Beetle: [{ years: "2012-2019", length: 4278, width: 1808, height: 1486 }],
    Golf: [
      { years: "1999-2006", length: 4149, width: 1735, height: 1444 },
      { years: "2007-2012", length: 4199, width: 1779, height: 1479 },
      { years: "2013-2019", length: 4255, width: 1799, height: 1452 },
      { years: "2020-2026", length: 4284, width: 1789, height: 1456 },
    ],
    "T-Cross": [
      { years: "2019-2026", length: 4199, width: 1760, height: 1570 },
    ],
    Voyage: [{ years: "2009-2023", length: 4218, width: 1656, height: 1464 }],
    Nivus: [{ years: "2021-2026", length: 4266, width: 1757, height: 1493 }],
    "T-Roc": [{ years: "2018-2026", length: 4234, width: 1819, height: 1573 }],
    Eos: [{ years: "2006-2015", length: 4423, width: 1791, height: 1444 }],
    Bora: [{ years: "1999-2015", length: 4376, width: 1735, height: 1446 }],
    Vento: [{ years: "2014-2022", length: 4390, width: 1699, height: 1467 }],
    Tiguan: [{ years: "2008-2016", length: 4427, width: 1809, height: 1686 }],
    "Tiguan Allspace": [
      { years: "2017-2026", length: 4703, width: 1839, height: 1672 },
    ],
    "Saveiro Cabina Sencilla": [
      { years: "2010-2026", length: 4474, width: 1713, height: 1520 },
    ],
    "Saveiro Cabina Doble": [
      { years: "2015-2026", length: 4493, width: 1713, height: 1539 },
    ],
    Taos: [{ years: "2021-2026", length: 4461, width: 1841, height: 1626 }],
    Tarek: [{ years: "2021-2026", length: 4468, width: 1841, height: 1624 }],
    Virtus: [
      { years: "2018-2022", length: 4482, width: 1751, height: 1472 },
      { years: "2023-2026", length: 4561, width: 1752, height: 1487 },
    ],
    "Jetta ": [{ years: "2008-2015", length: 4402, width: 1735, height: 1446 }],
    Jetta: [
      { years: "1999-2005", length: 4376, width: 1735, height: 1446 },
      { years: "2006-2010", length: 4554, width: 1779, height: 1459 },
      { years: "2011-2018", length: 4644, width: 1778, height: 1454 },
      { years: "2019-2026", length: 4702, width: 1799, height: 1452 },
    ],
    "ID.4": [{ years: "2021-2026", length: 4584, width: 1852, height: 1612 }],
    Touareg: [
      { years: "2003-2010", length: 4754, width: 1928, height: 1726 },
      { years: "2011-2018", length: 4795, width: 1940, height: 1709 },
      { years: "2019-2026", length: 4878, width: 1984, height: 1717 },
    ],
    Passat: [
      { years: "2006-2010", length: 4765, width: 1820, height: 1472 },
      { years: "2011-2015", length: 4769, width: 1820, height: 1470 },
      { years: "2016-2023", length: 4775, width: 1832, height: 1483 },
    ],
    Transporter: [
      { years: "2004-2015", length: 4892, width: 1904, height: 1970 },
      { years: "2016-2026", length: 4904, width: 1904, height: 1990 },
    ],
    Kombi: [{ years: "1975-2013", length: 4505, width: 1720, height: 2040 }],
    Teramont: [
      { years: "2018-2023", length: 5037, width: 1989, height: 1775 },
      { years: "2024-2026", length: 5097, width: 1989, height: 1788 },
    ],
    Atlas: [
      { years: "2018-2023", length: 5037, width: 1989, height: 1775 },
      { years: "2024-2026", length: 5097, width: 1989, height: 1788 },
    ],
    Amarok: [
      { years: "2011-2022", length: 5254, width: 1954, height: 1834 },
      { years: "2023-2026", length: 5350, width: 1997, height: 1882 },
    ],
    Crafter: [
      { years: "2006-2016", length: 5245, width: 1993, height: 2415 },
      { years: "2017-2026", length: 5986, width: 2040, height: 2355 },
    ],
  },

  "Mercedes-Benz": {
    "Clase A Hatchback": [
      { years: "1997-2004", length: 3575, width: 1719, height: 1575 },
      { years: "2005-2012", length: 3838, width: 1764, height: 1593 },
      { years: "2013-2018", length: 4292, width: 1780, height: 1433 },
      { years: "2019-2026", length: 4419, width: 1796, height: 1440 },
    ],
    "Clase A Sedan": [
      { years: "2019-2026", length: 4549, width: 1796, height: 1446 },
    ],
    "Clase B": [
      { years: "2005-2011", length: 4270, width: 1777, height: 1603 },
      { years: "2012-2018", length: 4359, width: 1786, height: 1557 },
      { years: "2019-2026", length: 4419, width: 1796, height: 1562 },
    ],
    CLA: [
      { years: "2013-2019", length: 4630, width: 1777, height: 1432 },
      { years: "2020-2026", length: 4688, width: 1830, height: 1439 },
    ],
    "Clase C Sedan": [
      { years: "2000-2007", length: 4525, width: 1728, height: 1425 },
      { years: "2008-2014", length: 4591, width: 1770, height: 1442 },
      { years: "2015-2021", length: 4686, width: 1810, height: 1442 },
      { years: "2022-2026", length: 4751, width: 1820, height: 1438 },
    ],
    "Clase C Coupe": [
      { years: "2011-2015", length: 4590, width: 1770, height: 1406 },
      { years: "2016-2023", length: 4686, width: 1810, height: 1405 },
    ],
    GLA: [
      { years: "2014-2020", length: 4417, width: 1804, height: 1494 },
      { years: "2021-2026", length: 4410, width: 1834, height: 1611 },
    ],
    GLB: [{ years: "2020-2026", length: 4634, width: 1834, height: 1658 }],
    "GLC SUV": [
      { years: "2016-2022", length: 4656, width: 1890, height: 1639 },
      { years: "2023-2026", length: 4716, width: 1890, height: 1640 },
    ],
    "GLC Coupe": [
      { years: "2017-2023", length: 4732, width: 1890, height: 1602 },
      { years: "2024-2026", length: 4763, width: 1890, height: 1605 },
    ],
    GLK: [{ years: "2008-2015", length: 4528, width: 1840, height: 1689 }],
    "Clase E Sedan": [
      { years: "2003-2009", length: 4818, width: 1822, height: 1450 },
      { years: "2010-2016", length: 4879, width: 1854, height: 1469 },
      { years: "2017-2023", length: 4923, width: 1852, height: 1468 },
      { years: "2024-2026", length: 4949, width: 1880, height: 1468 },
    ],
    "GLE SUV": [
      { years: "2016-2019", length: 4819, width: 1935, height: 1796 },
      { years: "2020-2026", length: 4924, width: 1947, height: 1797 },
    ],
    "GLE Coupe": [
      { years: "2016-2019", length: 4900, width: 2003, height: 1731 },
      { years: "2020-2026", length: 4939, width: 2010, height: 1730 },
    ],
    "Clase M": [
      { years: "1998-2005", length: 4587, width: 1833, height: 1776 },
      { years: "2006-2011", length: 4780, width: 1911, height: 1815 },
      { years: "2012-2015", length: 4804, width: 1926, height: 1796 },
    ],
    ML: [{ years: "1998-2015", length: 4804, width: 1926, height: 1796 }],
    GLS: [
      { years: "2016-2019", length: 5130, width: 1934, height: 1850 },
      { years: "2020-2026", length: 5207, width: 1956, height: 1823 },
    ],
    "GLS Maybach": [
      { years: "2021-2026", length: 5205, width: 2030, height: 1838 },
    ],
    GL: [
      { years: "2007-2012", length: 5085, width: 1920, height: 1840 },
      { years: "2013-2015", length: 5120, width: 1934, height: 1850 },
    ],
    "Clase G": [
      { years: "1990-2018", length: 4662, width: 1760, height: 1951 },
      { years: "2019-2026", length: 4817, width: 1931, height: 1969 },
    ],
    "Clase S": [
      { years: "2014-2020", length: 5116, width: 1899, height: 1496 },
      { years: "2021-2026", length: 5179, width: 1921, height: 1503 },
    ],
    CLS: [
      { years: "2004-2010", length: 4913, width: 1873, height: 1403 },
      { years: "2011-2018", length: 4940, width: 1881, height: 1416 },
      { years: "2019-2023", length: 4988, width: 1890, height: 1435 },
    ],
    EQA: [{ years: "2021-2026", length: 4463, width: 1834, height: 1620 }],
    EQB: [{ years: "2021-2026", length: 4684, width: 1834, height: 1667 }],
    "EQE SUV": [
      { years: "2023-2026", length: 4863, width: 1940, height: 1686 },
    ],
    "EQE Sedan": [
      { years: "2022-2026", length: 4946, width: 1906, height: 1512 },
    ],
    "EQS SUV": [
      { years: "2023-2026", length: 5125, width: 1959, height: 1718 },
    ],
    "EQS Sedan": [
      { years: "2022-2026", length: 5216, width: 1926, height: 1512 },
    ],
    "Clase X": [
      { years: "2017-2020", length: 5340, width: 1920, height: 1819 },
    ],
    SLK: [
      { years: "1996-2004", length: 3995, width: 1715, height: 1278 },
      { years: "2005-2010", length: 4082, width: 1777, height: 1296 },
      { years: "2011-2016", length: 4134, width: 1810, height: 1301 },
    ],
    SLC: [{ years: "2016-2020", length: 4133, width: 1810, height: 1301 }],
    "SL Roadster": [
      { years: "2002-2011", length: 4535, width: 1815, height: 1298 },
      { years: "2012-2020", length: 4612, width: 1877, height: 1315 },
      { years: "2022-2026", length: 4705, width: 1915, height: 1354 },
    ],
    "AMG GT": [
      { years: "2015-2023", length: 4544, width: 1939, height: 1287 },
      { years: "2024-2026", length: 4728, width: 1984, height: 1354 },
    ],
    "AMG GT 4 puertas": [
      { years: "2019-2026", length: 5054, width: 1953, height: 1442 },
    ],
    Vito: [
      { years: "2003-2014", length: 4748, width: 1901, height: 1902 },
      { years: "2015-2026", length: 4895, width: 1928, height: 1910 },
    ],
    "V-Class": [
      { years: "2014-2026", length: 5140, width: 1928, height: 1880 },
    ],
    "Sprinter Corta": [
      { years: "2007-2026", length: 5267, width: 1993, height: 2435 },
    ],
    "Sprinter Larga": [
      { years: "2007-2026", length: 5910, width: 2020, height: 2720 },
    ],
    "Sprinter Extra Larga": [
      { years: "2007-2026", length: 7361, width: 2020, height: 2820 },
    ],
    Citan: [{ years: "2012-2026", length: 4488, width: 1859, height: 1832 }],
    "Clase T": [
      { years: "2022-2026", length: 4498, width: 1859, height: 1811 },
    ],
  },

  BMW: {
    "Serie 1": [
      { years: "2004-2011", length: 4239, width: 1748, height: 1421 },
      { years: "2012-2019", length: 4324, width: 1765, height: 1421 },
      { years: "2020-2026", length: 4319, width: 1799, height: 1434 },
    ],
    "Serie 2 Coupe": [
      { years: "2014-2021", length: 4432, width: 1774, height: 1418 },
      { years: "2022-2026", length: 4537, width: 1838, height: 1390 },
    ],
    "Serie 2 Gran Coupe": [
      { years: "2020-2026", length: 4526, width: 1800, height: 1420 },
    ],
    "Serie 3 Sedan": [
      { years: "1998-2005", length: 4471, width: 1739, height: 1415 },
      { years: "2006-2011", length: 4531, width: 1817, height: 1421 },
      { years: "2012-2018", length: 4624, width: 1811, height: 1429 },
      { years: "2019-2026", length: 4709, width: 1827, height: 1435 },
    ],
    "Serie 4 Coupe": [
      { years: "2014-2020", length: 4638, width: 1825, height: 1377 },
      { years: "2021-2026", length: 4768, width: 1852, height: 1383 },
    ],
    "Serie 4 Gran Coupe": [
      { years: "2014-2020", length: 4638, width: 1825, height: 1389 },
      { years: "2021-2026", length: 4783, width: 1852, height: 1442 },
    ],
    "Serie 5 Sedan": [
      { years: "2003-2010", length: 4841, width: 1846, height: 1468 },
      { years: "2011-2016", length: 4899, width: 1860, height: 1464 },
      { years: "2017-2023", length: 4936, width: 1868, height: 1479 },
      { years: "2024-2026", length: 5060, width: 1900, height: 1515 },
    ],
    "Serie 7": [
      { years: "2002-2008", length: 5039, width: 1902, height: 1491 },
      { years: "2009-2015", length: 5072, width: 1902, height: 1479 },
      { years: "2016-2022", length: 5098, width: 1902, height: 1467 },
      { years: "2023-2026", length: 5391, width: 1950, height: 1544 },
    ],
    "Serie 8 Coupe": [
      { years: "2019-2026", length: 4843, width: 1902, height: 1341 },
    ],
    "Serie 8 Gran Coupe": [
      { years: "2020-2026", length: 5082, width: 1932, height: 1407 },
    ],
    X1: [
      { years: "2009-2015", length: 4454, width: 1798, height: 1545 },
      { years: "2016-2022", length: 4439, width: 1821, height: 1598 },
      { years: "2023-2026", length: 4500, width: 1845, height: 1642 },
    ],
    X2: [
      { years: "2018-2023", length: 4360, width: 1824, height: 1526 },
      { years: "2024-2026", length: 4554, width: 1845, height: 1590 },
    ],
    X3: [
      { years: "2003-2010", length: 4565, width: 1853, height: 1674 },
      { years: "2011-2017", length: 4648, width: 1881, height: 1661 },
      { years: "2018-2026", length: 4708, width: 1891, height: 1676 },
    ],
    X4: [
      { years: "2014-2018", length: 4671, width: 1881, height: 1624 },
      { years: "2019-2026", length: 4752, width: 1918, height: 1621 },
    ],
    X5: [
      { years: "2000-2006", length: 4667, width: 1872, height: 1715 },
      { years: "2007-2013", length: 4854, width: 1933, height: 1776 },
      { years: "2014-2018", length: 4886, width: 1938, height: 1762 },
      { years: "2019-2026", length: 4922, width: 2004, height: 1745 },
    ],
    X6: [
      { years: "2008-2014", length: 4877, width: 1983, height: 1690 },
      { years: "2015-2019", length: 4909, width: 1989, height: 1702 },
      { years: "2020-2026", length: 4935, width: 2004, height: 1696 },
    ],
    X7: [{ years: "2019-2026", length: 5151, width: 2000, height: 1805 }],
    XM: [{ years: "2023-2026", length: 5110, width: 2005, height: 1755 }],
    "Z4 Roadster": [
      { years: "2003-2008", length: 4091, width: 1781, height: 1299 },
      { years: "2009-2016", length: 4239, width: 1790, height: 1291 },
      { years: "2019-2026", length: 4324, width: 1864, height: 1304 },
    ],
    i3: [{ years: "2013-2022", length: 3999, width: 1775, height: 1578 }],
    i4: [{ years: "2022-2026", length: 4783, width: 1852, height: 1448 }],
    iX: [{ years: "2022-2026", length: 4953, width: 1967, height: 1695 }],
  },

  Audi: {
    "A1 Sportback": [
      { years: "2010-2018", length: 3954, width: 1740, height: 1416 },
      { years: "2019-2026", length: 4029, width: 1740, height: 1409 },
    ],
    A2: [{ years: "2000-2005", length: 3826, width: 1673, height: 1553 }],
    "A3 Sedan": [
      { years: "2013-2020", length: 4456, width: 1796, height: 1416 },
      { years: "2021-2026", length: 4495, width: 1816, height: 1425 },
    ],
    "A3 Sportback": [
      { years: "2005-2012", length: 4285, width: 1765, height: 1420 },
      { years: "2013-2020", length: 4310, width: 1785, height: 1421 },
      { years: "2021-2026", length: 4343, width: 1816, height: 1430 },
    ],
    "A3 Cabriolet": [
      { years: "2008-2013", length: 4238, width: 1777, height: 1424 },
      { years: "2014-2020", length: 4423, width: 1793, height: 1409 },
    ],
    "A4 Sedan": [
      { years: "2001-2008", length: 4586, width: 1772, height: 1427 },
      { years: "2009-2015", length: 4703, width: 1826, height: 1427 },
      { years: "2016-2024", length: 4762, width: 1842, height: 1428 },
    ],
    "A5 Coupe": [
      { years: "2007-2016", length: 4625, width: 1854, height: 1372 },
      { years: "2017-2024", length: 4673, width: 1846, height: 1371 },
    ],
    "A5 Sportback": [
      { years: "2009-2016", length: 4712, width: 1854, height: 1391 },
      { years: "2017-2024", length: 4733, width: 1843, height: 1386 },
    ],
    "A6 Sedan": [
      { years: "2005-2011", length: 4916, width: 1855, height: 1459 },
      { years: "2012-2018", length: 4915, width: 1874, height: 1455 },
      { years: "2019-2026", length: 4939, width: 1886, height: 1457 },
    ],
    "A7 Sportback": [
      { years: "2010-2017", length: 4969, width: 1911, height: 1420 },
      { years: "2018-2026", length: 4969, width: 1908, height: 1422 },
    ],
    A8: [
      { years: "2010-2017", length: 5137, width: 1949, height: 1460 },
      { years: "2018-2026", length: 5172, width: 1945, height: 1473 },
    ],
    Q2: [{ years: "2016-2026", length: 4191, width: 1794, height: 1508 }],
    "Q3 SUV": [
      { years: "2012-2018", length: 4385, width: 1831, height: 1608 },
      { years: "2019-2026", length: 4484, width: 1849, height: 1616 },
    ],
    "Q3 Sportback": [
      { years: "2020-2026", length: 4500, width: 1843, height: 1567 },
    ],
    "Q4 e-tron": [
      { years: "2021-2026", length: 4588, width: 1865, height: 1632 },
    ],
    "Q4 Sportback e-tron": [
      { years: "2021-2026", length: 4588, width: 1865, height: 1614 },
    ],
    "Q5 SUV": [
      { years: "2009-2017", length: 4629, width: 1880, height: 1653 },
      { years: "2018-2024", length: 4663, width: 1893, height: 1659 },
      { years: "2025-2026", length: 4717, width: 1900, height: 1660 },
    ],
    "Q5 Sportback": [
      { years: "2021-2026", length: 4689, width: 1893, height: 1660 },
    ],
    Q7: [
      { years: "2006-2015", length: 5086, width: 1983, height: 1737 },
      { years: "2016-2026", length: 5063, width: 1970, height: 1741 },
    ],
    Q8: [{ years: "2019-2026", length: 4986, width: 1995, height: 1705 }],
    "e-tron SUV": [
      { years: "2019-2023", length: 4901, width: 1935, height: 1616 },
    ],
    "Q8 e-tron": [
      { years: "2024-2026", length: 4915, width: 1937, height: 1633 },
    ],
    "e-tron GT": [
      { years: "2021-2026", length: 4989, width: 1964, height: 1413 },
    ],
    "TT Coupe": [
      { years: "2006-2014", length: 4178, width: 1842, height: 1352 },
      { years: "2015-2023", length: 4177, width: 1832, height: 1353 },
    ],
    R8: [
      { years: "2007-2015", length: 4431, width: 1904, height: 1249 },
      { years: "2016-2023", length: 4426, width: 1940, height: 1240 },
    ],
  },

  Renault: {
    Kwid: [{ years: "2019-2026", length: 3679, width: 1579, height: 1478 }],
    "Kwid E-Tech": [
      { years: "2022-2026", length: 3734, width: 1579, height: 1516 },
    ],
    Kardian: [{ years: "2024-2026", length: 4119, width: 1773, height: 1544 }],
    Sandero: [
      { years: "2008-2012", length: 4020, width: 1746, height: 1534 },
      { years: "2013-2020", length: 4060, width: 1733, height: 1523 },
      { years: "2021-2026", length: 4088, width: 1777, height: 1499 },
    ],
    Stepway: [
      { years: "2009-2012", length: 4091, width: 1751, height: 1640 },
      { years: "2013-2020", length: 4066, width: 1761, height: 1559 },
      { years: "2021-2026", length: 4099, width: 1777, height: 1535 },
    ],
    Logan: [
      { years: "2005-2013", length: 4250, width: 1740, height: 1525 },
      { years: "2014-2026", length: 4349, width: 1733, height: 1517 },
    ],
    Clio: [
      { years: "1998-2012", length: 3811, width: 1639, height: 1417 },
      { years: "2013-2019", length: 4062, width: 1732, height: 1448 },
      { years: "2020-2026", length: 4050, width: 1798, height: 1440 },
    ],
    Megane: [
      { years: "2003-2009", length: 4498, width: 1777, height: 1460 },
      { years: "2010-2016", length: 4295, width: 1808, height: 1471 },
      { years: "2017-2024", length: 4359, width: 1814, height: 1438 },
    ],
    "Megane E-Tech": [
      { years: "2022-2026", length: 4199, width: 1764, height: 1505 },
    ],
    Fluence: [{ years: "2010-2018", length: 4618, width: 1809, height: 1479 }],
    Talisman: [{ years: "2015-2022", length: 4848, width: 1869, height: 1463 }],
    Captur: [
      { years: "2013-2019", length: 4122, width: 1778, height: 1566 },
      { years: "2020-2026", length: 4227, width: 1797, height: 1576 },
    ],
    Duster: [
      { years: "2012-2017", length: 4315, width: 1822, height: 1690 },
      { years: "2018-2023", length: 4341, width: 1804, height: 1693 },
      { years: "2024-2026", length: 4343, width: 1810, height: 1660 },
    ],
    Oroch: [{ years: "2016-2026", length: 4700, width: 1821, height: 1694 }],
    Koleos: [
      { years: "2008-2016", length: 4520, width: 1855, height: 1695 },
      { years: "2017-2026", length: 4673, width: 1843, height: 1678 },
    ],
    Austral: [{ years: "2022-2026", length: 4510, width: 1825, height: 1618 }],
    Arkana: [{ years: "2021-2026", length: 4568, width: 1821, height: 1571 }],
    Rafale: [{ years: "2024-2026", length: 4710, width: 1866, height: 1613 }],
    Symbioz: [{ years: "2024-2026", length: 4413, width: 1797, height: 1575 }],
    Scenic: [
      { years: "2003-2009", length: 4259, width: 1810, height: 1620 },
      { years: "2010-2016", length: 4344, width: 1845, height: 1637 },
      { years: "2017-2022", length: 4406, width: 1866, height: 1653 },
    ],
    "Scenic E-Tech": [
      { years: "2024-2026", length: 4470, width: 1864, height: 1570 },
    ],
    Espace: [
      { years: "2015-2023", length: 4857, width: 1888, height: 1677 },
      { years: "2024-2026", length: 4722, width: 1843, height: 1645 },
    ],
    Alaskan: [{ years: "2017-2026", length: 5330, width: 1850, height: 1819 }],
    Zoe: [{ years: "2012-2024", length: 4084, width: 1730, height: 1562 }],
    Twizy: [{ years: "2012-2023", length: 2338, width: 1237, height: 1454 }],
    Kangoo: [
      { years: "1997-2007", length: 3995, width: 1663, height: 1827 },
      { years: "2008-2020", length: 4213, width: 1829, height: 1803 },
      { years: "2021-2026", length: 4486, width: 1919, height: 1838 },
    ],
    Express: [{ years: "2021-2026", length: 4393, width: 1775, height: 1811 }],
    Trafic: [{ years: "2014-2026", length: 4999, width: 1956, height: 1971 }],
    Master: [
      { years: "2010-2024", length: 5048, width: 2070, height: 2307 },
      { years: "2025-2026", length: 5310, width: 2080, height: 2310 },
    ],
  },

  Peugeot: {
    107: [{ years: "2005-2014", length: 3430, width: 1630, height: 1470 }],
    108: [{ years: "2014-2021", length: 3475, width: 1615, height: 1460 }],
    206: [{ years: "1998-2012", length: 3835, width: 1652, height: 1428 }],
    207: [{ years: "2006-2014", length: 4030, width: 1720, height: 1472 }],
    208: [
      { years: "2013-2019", length: 3963, width: 1739, height: 1460 },
      { years: "2020-2026", length: 4055, width: 1745, height: 1430 },
    ],
    "e-208": [{ years: "2020-2026", length: 4055, width: 1745, height: 1430 }],
    301: [{ years: "2012-2023", length: 4442, width: 1748, height: 1466 }],
    "308 Hatchback": [
      { years: "2008-2013", length: 4276, width: 1815, height: 1498 },
      { years: "2014-2021", length: 4253, width: 1804, height: 1457 },
      { years: "2022-2026", length: 4367, width: 1852, height: 1441 },
    ],
    "308 SW": [
      { years: "2008-2013", length: 4500, width: 1815, height: 1555 },
      { years: "2014-2021", length: 4585, width: 1804, height: 1471 },
      { years: "2022-2026", length: 4636, width: 1852, height: 1442 },
    ],
    "407 Sedan": [
      { years: "2004-2011", length: 4676, width: 1811, height: 1445 },
    ],
    408: [{ years: "2023-2026", length: 4687, width: 1848, height: 1478 }],
    508: [
      { years: "2011-2018", length: 4792, width: 1853, height: 1456 },
      { years: "2019-2026", length: 4750, width: 1859, height: 1403 },
    ],
    2008: [
      { years: "2014-2019", length: 4159, width: 1739, height: 1550 },
      { years: "2020-2026", length: 4300, width: 1770, height: 1530 },
    ],
    "e-2008": [{ years: "2020-2026", length: 4300, width: 1770, height: 1530 }],
    3008: [
      { years: "2009-2016", length: 4365, width: 1837, height: 1639 },
      { years: "2017-2023", length: 4447, width: 1841, height: 1620 },
      { years: "2024-2026", length: 4540, width: 1895, height: 1640 },
    ],
    5008: [
      { years: "2009-2016", length: 4529, width: 1837, height: 1647 },
      { years: "2017-2023", length: 4641, width: 1844, height: 1640 },
      { years: "2024-2026", length: 4790, width: 1895, height: 1690 },
    ],
    Landtrek: [{ years: "2020-2026", length: 5330, width: 1963, height: 1897 }],
    Rifter: [{ years: "2018-2026", length: 4403, width: 1848, height: 1874 }],
  },

  "Land Rover": {
    "Defender 90": [
      { years: "1983-2016", length: 3883, width: 1790, height: 1963 },
      { years: "2020-2026", length: 4323, width: 1996, height: 1974 },
    ],
    "Defender 110": [
      { years: "1983-2016", length: 4599, width: 1790, height: 2026 },
      { years: "2020-2026", length: 4758, width: 1996, height: 1967 },
    ],
    "Defender 130": [
      { years: "2022-2026", length: 5358, width: 1996, height: 1970 },
    ],
    Discovery: [
      { years: "1998-2004", length: 4705, width: 1885, height: 1940 },
      { years: "2004-2009", length: 4835, width: 1915, height: 1887 },
      { years: "2010-2016", length: 4829, width: 1915, height: 1882 },
      { years: "2017-2026", length: 4956, width: 2000, height: 1888 },
    ],
    "Discovery Sport": [
      { years: "2015-2019", length: 4599, width: 1894, height: 1724 },
      { years: "2020-2026", length: 4597, width: 1904, height: 1727 },
    ],
    Freelander: [
      { years: "1997-2006", length: 4382, width: 1811, height: 1757 },
      { years: "2006-2015", length: 4500, width: 1910, height: 1740 },
    ],
    "Range Rover": [
      { years: "1970-1995", length: 4445, width: 1781, height: 1781 },
      { years: "2002-2012", length: 4950, width: 1923, height: 1863 },
      { years: "2013-2021", length: 5000, width: 1983, height: 1835 },
      { years: "2022-2026", length: 5052, width: 2047, height: 1870 },
    ],
    "Range Rover LWB": [
      { years: "2014-2021", length: 5200, width: 1983, height: 1840 },
      { years: "2022-2026", length: 5252, width: 2047, height: 1870 },
    ],
    "Range Rover Sport": [
      { years: "2005-2013", length: 4783, width: 1928, height: 1784 },
      { years: "2014-2022", length: 4879, width: 1983, height: 1803 },
      { years: "2023-2026", length: 4946, width: 2047, height: 1820 },
    ],
    "Range Rover Velar": [
      { years: "2017-2026", length: 4797, width: 1930, height: 1683 },
    ],
    "Range Rover Evoque": [
      { years: "2011-2018", length: 4370, width: 1900, height: 1635 },
      { years: "2019-2026", length: 4371, width: 1904, height: 1649 },
    ],
    "Range Rover Evoque Coupe": [
      { years: "2011-2018", length: 4355, width: 1900, height: 1605 },
    ],
  },

  Porsche: {
    "911 Carrera": [
      { years: "1998-2004", length: 4430, width: 1765, height: 1305 },
      { years: "2005-2011", length: 4435, width: 1808, height: 1310 },
      { years: "2012-2018", length: 4491, width: 1808, height: 1303 },
      { years: "2019-2026", length: 4519, width: 1852, height: 1298 },
    ],
    "911 Turbo": [
      { years: "2001-2005", length: 4435, width: 1830, height: 1295 },
      { years: "2006-2012", length: 4450, width: 1852, height: 1300 },
      { years: "2013-2020", length: 4506, width: 1880, height: 1294 },
      { years: "2021-2026", length: 4535, width: 1900, height: 1303 },
    ],
    "911 GT3": [
      { years: "1999-2005", length: 4435, width: 1770, height: 1275 },
      { years: "2006-2011", length: 4445, width: 1808, height: 1280 },
      { years: "2013-2019", length: 4545, width: 1852, height: 1269 },
      { years: "2021-2026", length: 4573, width: 1852, height: 1279 },
    ],
    "911 GT3 RS": [
      { years: "2003-2005", length: 4435, width: 1770, height: 1280 },
      { years: "2006-2012", length: 4460, width: 1852, height: 1280 },
      { years: "2015-2019", length: 4557, width: 1880, height: 1291 },
      { years: "2023-2026", length: 4572, width: 1900, height: 1322 },
    ],
    Taycan: [{ years: "2020-2026", length: 4963, width: 1966, height: 1378 }],
    "Taycan Cross Turismo": [
      { years: "2021-2026", length: 4974, width: 1967, height: 1409 },
    ],
    Panamera: [
      { years: "2010-2016", length: 4970, width: 1931, height: 1418 },
      { years: "2017-2023", length: 5049, width: 1937, height: 1423 },
      { years: "2024-2026", length: 5052, width: 1937, height: 1423 },
    ],
    "Panamera Executive": [
      { years: "2017-2026", length: 5199, width: 1937, height: 1428 },
    ],
    Macan: [{ years: "2014-2024", length: 4681, width: 1923, height: 1624 }],
    "Macan Electric": [
      { years: "2024-2026", length: 4784, width: 1938, height: 1622 },
    ],
    Cayenne: [
      { years: "2003-2010", length: 4782, width: 1928, height: 1699 },
      { years: "2011-2017", length: 4846, width: 1939, height: 1705 },
      { years: "2018-2025", length: 4918, width: 1983, height: 1696 },
    ],
    "Cayenne Electric": [
      { years: "2026-2026", length: 4930, width: 1985, height: 1698 },
    ],
    "Cayenne Coupe": [
      { years: "2019-2026", length: 4931, width: 1983, height: 1676 },
    ],
    "718 Boxster": [
      { years: "2016-2026", length: 4379, width: 1801, height: 1281 },
    ],
    "718 Cayman": [
      { years: "2016-2026", length: 4379, width: 1801, height: 1295 },
    ],
    "718 Cayman GT4 RS": [
      { years: "2022-2026", length: 4456, width: 1822, height: 1267 },
    ],
    "Boxster (Legacy)": [
      { years: "1996-2004", length: 4320, width: 1780, height: 1290 },
      { years: "2005-2012", length: 4342, width: 1801, height: 1292 },
      { years: "2013-2016", length: 4374, width: 1801, height: 1282 },
    ],
    "Cayman (Legacy)": [
      { years: "2005-2012", length: 4341, width: 1801, height: 1305 },
      { years: "2013-2016", length: 4380, width: 1801, height: 1294 },
    ],
  },

  Volvo: {
    "240 / 244": [
      { years: "1974-1993", length: 4785, width: 1710, height: 1460 },
    ],
    "850 Sedan": [
      { years: "1991-1997", length: 4661, width: 1760, height: 1400 },
    ],
    "850 Wagon": [
      { years: "1992-1997", length: 4710, width: 1760, height: 1445 },
    ],
    "940 / 960": [
      { years: "1990-1998", length: 4870, width: 1750, height: 1410 },
    ],
    C30: [{ years: "2006-2013", length: 4252, width: 1782, height: 1447 }],
    "C40 Recharge": [
      { years: "2022-2024", length: 4440, width: 1873, height: 1591 },
    ],
    C70: [
      { years: "1997-2005", length: 4716, width: 1817, height: 1400 },
      { years: "2006-2013", length: 4582, width: 1817, height: 1400 },
    ],
    EC40: [{ years: "2024-2026", length: 4440, width: 1873, height: 1591 }],
    EM90: [{ years: "2024-2026", length: 5206, width: 2024, height: 1859 }],
    ES90: [{ years: "2025-2026", length: 4999, width: 1945, height: 1547 }],
    EX30: [{ years: "2024-2026", length: 4233, width: 1836, height: 1555 }],
    EX40: [{ years: "2024-2026", length: 4440, width: 1873, height: 1651 }],
    EX60: [{ years: "2025-2026", length: 4712, width: 1902, height: 1660 }],
    EX90: [{ years: "2024-2026", length: 5037, width: 1964, height: 1747 }],
    S40: [
      { years: "1995-2004", length: 4480, width: 1720, height: 1410 },
      { years: "2004-2012", length: 4468, width: 1770, height: 1452 },
    ],
    S60: [
      { years: "2000-2009", length: 4576, width: 1804, height: 1428 },
      { years: "2010-2018", length: 4628, width: 1865, height: 1484 },
      { years: "2019-2026", length: 4761, width: 1850, height: 1431 },
    ],
    S70: [{ years: "1996-2000", length: 4720, width: 1760, height: 1400 }],
    S80: [
      { years: "1998-2006", length: 4820, width: 1830, height: 1430 },
      { years: "2006-2016", length: 4851, width: 1860, height: 1490 },
    ],
    S90: [{ years: "2017-2026", length: 4963, width: 1879, height: 1443 }],
    V40: [{ years: "2013-2019", length: 4369, width: 1802, height: 1445 }],
    "V40 Cross Country": [
      { years: "2013-2019", length: 4370, width: 1802, height: 1458 },
    ],
    V50: [{ years: "2004-2012", length: 4512, width: 1770, height: 1452 }],
    V60: [
      { years: "2010-2018", length: 4635, width: 1865, height: 1484 },
      { years: "2019-2026", length: 4761, width: 1850, height: 1427 },
    ],
    "V60 Cross Country": [
      { years: "2019-2026", length: 4784, width: 1850, height: 1499 },
    ],
    V70: [
      { years: "1996-2000", length: 4720, width: 1760, height: 1430 },
      { years: "2000-2007", length: 4710, width: 1800, height: 1460 },
      { years: "2008-2016", length: 4823, width: 1861, height: 1547 },
    ],
    V90: [{ years: "2017-2026", length: 4936, width: 1879, height: 1475 }],
    "V90 Cross Country": [
      { years: "2017-2026", length: 4939, width: 1879, height: 1543 },
    ],
    XC40: [{ years: "2018-2026", length: 4425, width: 1863, height: 1652 }],
    XC60: [
      { years: "2008-2017", length: 4628, width: 1891, height: 1713 },
      { years: "2018-2026", length: 4708, width: 1902, height: 1658 },
    ],
    XC70: [
      { years: "2000-2007", length: 4733, width: 1860, height: 1562 },
      { years: "2007-2016", length: 4838, width: 1870, height: 1604 },
    ],
    XC90: [
      { years: "2002-2014", length: 4807, width: 1898, height: 1784 },
      { years: "2015-2026", length: 4953, width: 1923, height: 1776 },
    ],
  },

  Ferrari: {
    F355: [{ years: "1994-1999", length: 4250, width: 1900, height: 1170 }],
    F40: [{ years: "1987-1992", length: 4358, width: 1970, height: 1124 }],
    "360 Modena": [
      { years: "1999-2005", length: 4477, width: 1922, height: 1214 },
    ],
    F50: [{ years: "1995-1997", length: 4480, width: 1986, height: 1120 }],
    Testarossa: [
      { years: "1984-1991", length: 4485, width: 1976, height: 1130 },
    ],
    F430: [{ years: "2004-2009", length: 4512, width: 1923, height: 1214 }],
    "430 Scuderia": [
      { years: "2007-2009", length: 4512, width: 1923, height: 1199 },
    ],
    "458 Italia": [
      { years: "2009-2015", length: 4527, width: 1937, height: 1213 },
    ],
    California: [
      { years: "2008-2014", length: 4562, width: 1900, height: 1322 },
    ],
    "296 GTB": [
      { years: "2022-2026", length: 4565, width: 1958, height: 1187 },
    ],
    "488 GTB": [
      { years: "2015-2019", length: 4568, width: 1952, height: 1213 },
    ],
    "California T": [
      { years: "2014-2017", length: 4570, width: 1910, height: 1322 },
    ],
    Portofino: [
      { years: "2017-2023", length: 4586, width: 1938, height: 1318 },
    ],
    "Portofino M": [
      { years: "2020-2023", length: 4594, width: 1938, height: 1318 },
    ],
    "488 Pista": [
      { years: "2018-2020", length: 4605, width: 1975, height: 1206 },
    ],
    "F8 Tributo": [
      { years: "2019-2023", length: 4611, width: 1979, height: 1206 },
    ],
    F12berlinetta: [
      { years: "2012-2017", length: 4618, width: 1942, height: 1273 },
    ],
    Roma: [{ years: "2020-2026", length: 4656, width: 1974, height: 1301 }],
    "812 Superfast": [
      { years: "2017-2024", length: 4657, width: 1971, height: 1276 },
    ],
    "599 GTB Fiorano": [
      { years: "2006-2012", length: 4665, width: 1962, height: 1336 },
    ],
    "Daytona SP3": [
      { years: "2022-2024", length: 4685, width: 2050, height: 1142 },
    ],
    LaFerrari: [
      { years: "2013-2016", length: 4702, width: 1992, height: 1116 },
    ],
    Enzo: [{ years: "2002-2004", length: 4702, width: 2035, height: 1147 }],
    "SF90 Stradale": [
      { years: "2019-2026", length: 4710, width: 1972, height: 1186 },
    ],
    "12Cilindri": [
      { years: "2024-2026", length: 4733, width: 1976, height: 1292 },
    ],
    "SF90 XX": [
      { years: "2023-2025", length: 4850, width: 2014, height: 1225 },
    ],
    FF: [{ years: "2011-2016", length: 4907, width: 1953, height: 1379 }],
    GTC4Lusso: [
      { years: "2016-2020", length: 4922, width: 1980, height: 1383 },
    ],
    Purosangue: [
      { years: "2023-2026", length: 4973, width: 2028, height: 1589 },
    ],
  },

  Lamborghini: {
    Gallardo: [{ years: "2003-2013", length: 4345, width: 1900, height: 1165 }],
    "Huracán LP610-4": [
      { years: "2014-2019", length: 4459, width: 1924, height: 1165 },
    ],
    Diablo: [{ years: "1990-2001", length: 4460, width: 2040, height: 1105 }],
    "Huracán EVO": [
      { years: "2019-2024", length: 4520, width: 1933, height: 1165 },
    ],
    "Huracán Sterrato": [
      { years: "2023-2024", length: 4525, width: 1956, height: 1248 },
    ],
    "Huracán STO": [
      { years: "2021-2024", length: 4549, width: 1945, height: 1220 },
    ],
    Murciélago: [
      { years: "2001-2010", length: 4580, width: 2045, height: 1135 },
    ],
    Temerario: [
      { years: "2025-2026", length: 4706, width: 1996, height: 1201 },
    ],
    "Aventador LP700-4": [
      { years: "2011-2016", length: 4780, width: 2030, height: 1136 },
    ],
    "Aventador S": [
      { years: "2017-2022", length: 4797, width: 2030, height: 1136 },
    ],
    "Countach LPI 800-4": [
      { years: "2022-2023", length: 4870, width: 2099, height: 1139 },
    ],
    "Aventador SVJ": [
      { years: "2018-2022", length: 4943, width: 2098, height: 1136 },
    ],
    Revuelto: [{ years: "2023-2026", length: 4947, width: 2033, height: 1160 }],
    "Sian FKP 37": [
      { years: "2020-2022", length: 4980, width: 2101, height: 1133 },
    ],
    Urus: [{ years: "2018-2022", length: 5112, width: 2016, height: 1638 }],
    "Urus SE": [
      { years: "2024-2026", length: 5123, width: 2022, height: 1638 },
    ],
    "Urus Performante": [
      { years: "2023-2026", length: 5137, width: 2026, height: 1618 },
    ],
  },

  McLaren: {
    "540C": [{ years: "2015-2021", length: 4529, width: 1915, height: 1201 }],
    "570S": [{ years: "2015-2021", length: 4529, width: 1915, height: 1201 }],
    "570GT": [{ years: "2016-2021", length: 4530, width: 1915, height: 1201 }],
    Artura: [{ years: "2022-2026", length: 4539, width: 1913, height: 1193 }],
    "720S": [{ years: "2017-2023", length: 4544, width: 1930, height: 1196 }],
    "750S": [{ years: "2023-2026", length: 4569, width: 1930, height: 1196 }],
    P1: [{ years: "2013-2015", length: 4588, width: 1946, height: 1188 }],
    "600LT": [{ years: "2018-2021", length: 4604, width: 1915, height: 1194 }],
    "650S": [{ years: "2014-2017", length: 4612, width: 1908, height: 1199 }],
    W1: [{ years: "2025-2026", length: 4635, width: 2014, height: 1182 }],
    GTS: [{ years: "2024-2026", length: 4683, width: 2045, height: 1213 }],
    Senna: [{ years: "2018-2023", length: 4744, width: 1958, height: 1195 }],
    Speedtail: [
      { years: "2020-2023", length: 5137, width: 1997, height: 1120 },
    ],
  },

  Mini: {
    "Cooper (3 puertas)": [
      {
        gen: "R50/R53",
        years: "2001-2006",
        length: 3627,
        width: 1689,
        height: 1407,
      },
      {
        gen: "R56",
        years: "2007-2013",
        length: 3714,
        width: 1684,
        height: 1407,
      },
      {
        gen: "F56",
        years: "2014-2023",
        length: 3821,
        width: 1727,
        height: 1414,
      },
      {
        gen: "J01/F66",
        years: "2024-2026",
        length: 3876,
        width: 1744,
        height: 1432,
      },
    ],
    "Cooper (5 puertas)": [
      {
        gen: "F55",
        years: "2015-2023",
        length: 3982,
        width: 1727,
        height: 1425,
      },
      {
        gen: "F65",
        years: "2024-2026",
        length: 4036,
        width: 1744,
        height: 1464,
      },
    ],
    "Cooper SE (Electric)": [
      {
        gen: "F56 BEV",
        years: "2020-2023",
        length: 3850,
        width: 1727,
        height: 1432,
      },
      {
        gen: "J01 SE",
        years: "2024-2026",
        length: 3858,
        width: 1756,
        height: 1460,
      },
    ],
    "Aceman (Electric Crossover)": [
      {
        gen: "J05",
        years: "2024-2026",
        length: 4076,
        width: 1754,
        height: 1515,
      },
    ],
    Countryman: [
      {
        gen: "R60",
        years: "2010-2016",
        length: 4097,
        width: 1789,
        height: 1561,
      },
      {
        gen: "F60",
        years: "2017-2023",
        length: 4299,
        width: 1822,
        height: 1557,
      },
      {
        gen: "U25",
        years: "2024-2026",
        length: 4444,
        width: 1843,
        height: 1661,
      },
    ],
    "Paceman (Coupe SUV)": [
      {
        gen: "R61",
        years: "2013-2016",
        length: 4109,
        width: 1786,
        height: 1518,
      },
    ],
    Clubman: [
      {
        gen: "R55",
        years: "2008-2014",
        length: 3945,
        width: 1684,
        height: 1425,
      },
      {
        gen: "F54",
        years: "2015-2024",
        length: 4253,
        width: 1800,
        height: 1441,
      },
    ],
    "Convertible (Cabrio)": [
      {
        gen: "R52",
        years: "2005-2008",
        length: 3635,
        width: 1689,
        height: 1415,
      },
      {
        gen: "R57",
        years: "2009-2015",
        length: 3724,
        width: 1684,
        height: 1415,
      },
      {
        gen: "F57",
        years: "2016-2024",
        length: 3876,
        width: 1727,
        height: 1415,
      },
      {
        gen: "F67",
        years: "2025-2026",
        length: 3879,
        width: 1744,
        height: 1432,
      },
    ],
    "Coupe (R58)": [
      {
        gen: "R58",
        years: "2011-2015",
        length: 3728,
        width: 1683,
        height: 1378,
      },
    ],
    "Roadster (R59)": [
      {
        gen: "R59",
        years: "2012-2015",
        length: 3734,
        width: 1683,
        height: 1390,
      },
    ],
    "John Cooper Works (JCW)": [
      {
        model: "Hatch 3D",
        years: "2015-2024",
        length: 3872,
        width: 1727,
        height: 1414,
      },
      {
        model: "Countryman JCW",
        years: "2024-2026",
        length: 4447,
        width: 1843,
        height: 1645,
      },
    ],
  },

  Seat: {
    Mii: [{ years: "2011-2021", length: 3557, width: 1641, height: 1478 }],
    Ibiza: [{ years: "2002-2026", length: 4059, width: 1780, height: 1444 }],
    Arona: [{ years: "2017-2026", length: 4138, width: 1780, height: 1552 }],
    Toledo: [
      { years: "2004-2009", length: 4458, width: 1768, height: 1568 },
      { years: "2012-2019", length: 4482, width: 1706, height: 1461 },
    ],
    Leon: [
      { years: "2005-2012", length: 4315, width: 1768, height: 1455 },
      { years: "2013-2026", length: 4368, width: 1800, height: 1456 },
    ],
    Altea: [{ years: "2004-2015", length: 4280, width: 1770, height: 1570 }],
    Ateca: [{ years: "2016-2026", length: 4381, width: 1841, height: 1615 }],
    Exeo: [{ years: "2008-2013", length: 4661, width: 1772, height: 1430 }],
    Tarraco: [{ years: "2018-2026", length: 4735, width: 1839, height: 1658 }],
    Alhambra: [{ years: "2010-2020", length: 4854, width: 1904, height: 1720 }],
  },

  Fiat: {
    500: [{ years: "2007-2026", length: 3546, width: 1627, height: 1488 }],
    Mobi: [{ years: "2016-2026", length: 3566, width: 1633, height: 1500 }],
    Panda: [{ years: "2011-2024", length: 3653, width: 1643, height: 1551 }],
    Uno: [
      { years: "1983-2013", length: 3692, width: 1548, height: 1445 },
      { years: "2010-2021", length: 3811, width: 1636, height: 1480 },
    ],
    Palio: [
      { years: "1996-2011", length: 3735, width: 1614, height: 1440 },
      { years: "2012-2018", length: 3875, width: 1670, height: 1504 },
    ],
    600: [{ years: "2023-2026", length: 4171, width: 1781, height: 1523 }],
    Argo: [{ years: "2017-2026", length: 3998, width: 1724, height: 1501 }],
    Punto: [{ years: "2005-2018", length: 4065, width: 1687, height: 1490 }],
    Pulse: [{ years: "2021-2026", length: 4099, width: 1774, height: 1579 }],
    Idea: [{ years: "2003-2016", length: 3931, width: 1698, height: 1680 }],
    Siena: [{ years: "1996-2016", length: 4135, width: 1614, height: 1425 }],
    "Grand Siena": [
      { years: "2012-2021", length: 4355, width: 1700, height: 1507 },
    ],
    Cronos: [{ years: "2018-2026", length: 4364, width: 1726, height: 1516 }],
    Fiorino: [
      { years: "1988-2013", length: 3950, width: 1620, height: 1870 },
      { years: "2014-2026", length: 4384, width: 1643, height: 1900 },
    ],
    Qubo: [{ years: "2008-2020", length: 3959, width: 1716, height: 1735 }],
    Fastback: [{ years: "2022-2026", length: 4427, width: 1774, height: 1545 }],
    Linea: [{ years: "2007-2018", length: 4560, width: 1730, height: 1494 }],
    Tipo: [{ years: "2015-2024", length: 4532, width: 1792, height: 1497 }],
    Strada: [
      { years: "1996-2019", length: 4409, width: 1664, height: 1590 },
      { years: "2020-2026", length: 4474, width: 1732, height: 1608 },
    ],
    Toro: [{ years: "2016-2026", length: 4945, width: 1844, height: 1740 }],
    Fullback: [{ years: "2016-2019", length: 5285, width: 1815, height: 1780 }],
    Titano: [{ years: "2024-2026", length: 5330, width: 1930, height: 1819 }],
  },

  Jaguar: {
    "E-Pace": [{ years: "2017-2026", length: 4395, width: 1984, height: 1649 }],
    "I-Pace": [{ years: "2018-2026", length: 4682, width: 2011, height: 1565 }],
    "F-Pace": [
      { years: "2016-2026", length: 4731, width: 1936, height: 1667 },
      { years: "2021-2026", length: 4747, width: 2071, height: 1664 },
    ],
    "F-Pace SVR": [
      { years: "2019-2026", length: 4762, width: 2070, height: 1670 },
    ],
    XE: [{ years: "2015-2024", length: 4672, width: 1850, height: 1416 }],
    "X-Type": [{ years: "2001-2009", length: 4674, width: 1788, height: 1392 }],
    "S-Type": [{ years: "1999-2008", length: 4861, width: 1819, height: 1422 }],
    XF: [
      { years: "2008-2015", length: 4961, width: 1877, height: 1460 },
      { years: "2016-2024", length: 4962, width: 1880, height: 1457 },
    ],
    "XF Sportbrake": [
      { years: "2017-2024", length: 4955, width: 1880, height: 1496 },
    ],
    XJ: [
      { years: "1994-2003", length: 5024, width: 1798, height: 1314 },
      { years: "2003-2009", length: 5090, width: 1860, height: 1448 },
      { years: "2010-2019", length: 5122, width: 1894, height: 1448 },
    ],
    "XJ L": [{ years: "2010-2019", length: 5252, width: 1894, height: 1448 }],
    "F-Type": [{ years: "2013-2024", length: 4470, width: 1923, height: 1311 }],
    XK: [
      { years: "1996-2006", length: 4760, width: 1829, height: 1295 },
      { years: "2007-2014", length: 4791, width: 1892, height: 1322 },
    ],
    "XJ-S": [{ years: "1975-1996", length: 4764, width: 1793, height: 1254 }],
    XJ220: [{ years: "1992-1994", length: 4930, width: 2000, height: 1150 }],
  },

  "Alfa Romeo": {
    "4C": [{ years: "2013-2020", length: 3989, width: 1864, height: 1183 }],
    SZ: [{ years: "1989-1991", length: 4060, width: 1730, height: 1300 }],
    Mito: [{ years: "2008-2018", length: 4063, width: 1720, height: 1446 }],
    Junior: [{ years: "2024-2026", length: 4173, width: 1781, height: 1533 }],
    147: [{ years: "2000-2010", length: 4224, width: 1730, height: 1443 }],
    GTV: [{ years: "1995-2005", length: 4285, width: 1781, height: 1316 }],
    Giulietta: [
      { years: "2010-2020", length: 4351, width: 1798, height: 1465 },
    ],
    Spider: [
      { years: "1995-2006", length: 4285, width: 1781, height: 1315 },
      { years: "2006-2010", length: 4393, width: 1830, height: 1318 },
    ],
    Brera: [{ years: "2005-2010", length: 4410, width: 1830, height: 1341 }],
    156: [{ years: "1997-2005", length: 4430, width: 1745, height: 1415 }],
    GT: [{ years: "2003-2010", length: 4489, width: 1763, height: 1362 }],
    Tonale: [{ years: "2022-2026", length: 4528, width: 1841, height: 1601 }],
    159: [{ years: "2005-2011", length: 4660, width: 1828, height: 1417 }],
    Giulia: [{ years: "2016-2026", length: 4643, width: 1860, height: 1436 }],
    Stelvio: [{ years: "2017-2026", length: 4702, width: 1955, height: 1681 }],
    166: [{ years: "1998-2007", length: 4720, width: 1815, height: 1416 }],
    "8C Competizione": [
      { years: "2007-2010", length: 4381, width: 1892, height: 1341 },
    ],
  },

  Maserati: {
    Spyder: [
      { years: "1989-1995", length: 4043, width: 1714, height: 1310 },
      { years: "2001-2007", length: 4303, width: 1822, height: 1305 },
    ],
    "3200 GT": [
      { years: "1998-2002", length: 4511, width: 1822, height: 1305 },
    ],
    Coupe: [{ years: "2002-2007", length: 4523, width: 1822, height: 1305 }],
    MC20: [{ years: "2020-2026", length: 4669, width: 1965, height: 1221 }],
    "MC20 Cielo": [
      { years: "2022-2026", length: 4669, width: 1965, height: 1217 },
    ],
    Grecale: [
      { years: "2022-2026", length: 4846, width: 1948, height: 1670 },
      { years: "2023-2026", length: 4859, width: 1979, height: 1659 },
    ],
    GranTurismo: [
      { years: "2007-2019", length: 4881, width: 1915, height: 1353 },
      { years: "2023-2026", length: 4959, width: 1957, height: 1353 },
    ],
    GranCabrio: [
      { years: "2010-2019", length: 4881, width: 1915, height: 1380 },
      { years: "2024-2026", length: 4966, width: 1957, height: 1365 },
    ],
    Ghibli: [
      { years: "1992-1998", length: 4223, width: 1775, height: 1300 },
      { years: "2013-2024", length: 4971, width: 1945, height: 1461 },
    ],
    Levante: [
      { years: "2016-2026", length: 5003, width: 1968, height: 1679 },
      { years: "2018-2026", length: 5020, width: 1981, height: 1698 },
    ],
    Quattroporte: [
      { years: "1994-2001", length: 4550, width: 1810, height: 1380 },
      { years: "2003-2012", length: 5052, width: 1895, height: 1438 },
      { years: "2013-2024", length: 5262, width: 1948, height: 1481 },
    ],
    MC12: [{ years: "2004-2005", length: 5143, width: 2096, height: 1205 }],
  },

  "Aston Martin": {
    Cygnet: [{ years: "2011-2013", length: 3078, width: 1680, height: 1500 }],
    "V8 Vantage": [
      { years: "1993-2000", length: 4745, width: 1944, height: 1330 },
      { years: "2005-2017", length: 4380, width: 1865, height: 1255 },
    ],
    "V12 Vantage": [
      { years: "2009-2018", length: 4385, width: 1865, height: 1250 },
      { years: "2022-2024", length: 4514, width: 1962, height: 1274 },
    ],
    Vantage: [
      { years: "2018-2023", length: 4465, width: 1942, height: 1273 },
      { years: "2024-2026", length: 4495, width: 2045, height: 1275 },
    ],
    Valkyrie: [{ years: "2021-2026", length: 4506, width: 1975, height: 1070 }],
    Valhalla: [{ years: "2024-2026", length: 4550, width: 1950, height: 1150 }],
    "One-77": [{ years: "2009-2012", length: 4601, width: 2204, height: 1222 }],
    DBS: [{ years: "2007-2012", length: 4721, width: 1905, height: 1280 }],
    "DBS Superleggera": [
      { years: "2018-2024", length: 4712, width: 1968, height: 1280 },
    ],
    DB7: [{ years: "1994-2004", length: 4646, width: 1830, height: 1270 }],
    DB9: [{ years: "2004-2016", length: 4710, width: 1875, height: 1270 }],
    Virage: [{ years: "2011-2012", length: 4703, width: 1904, height: 1282 }],
    DB11: [{ years: "2016-2023", length: 4739, width: 1940, height: 1279 }],
    DB12: [{ years: "2023-2026", length: 4725, width: 1980, height: 1295 }],
    Vanquish: [
      { years: "2001-2007", length: 4665, width: 1923, height: 1318 },
      { years: "2012-2018", length: 4720, width: 1910, height: 1294 },
      { years: "2024-2026", length: 4850, width: 1980, height: 1290 },
    ],
    Rapide: [{ years: "2010-2020", length: 5020, width: 1929, height: 1350 }],
    DBX: [{ years: "2020-2026", length: 5039, width: 1998, height: 1680 }],
    "Lagonda Taraf": [
      { years: "2015-2016", length: 5396, width: 1917, height: 1389 },
    ],
  },

  //==================
  //    AMERICAN
  //==================
  Ford: {
    Festiva: [{ years: "1986-2002", length: 3570, width: 1605, height: 1450 }],
    KA: [
      { years: "1997-2008", length: 3620, width: 1639, height: 1411 },
      { years: "2015-2021", length: 3886, width: 1695, height: 1525 },
    ],
    "Fiesta Hatchback": [
      { years: "2002-2008", length: 3916, width: 1683, height: 1430 },
      { years: "2011-2019", length: 4067, width: 1722, height: 1473 },
    ],
    "Figo Hatchback": [
      { years: "2015-2021", length: 3886, width: 1695, height: 1525 },
    ],
    Ikon: [{ years: "2000-2007", length: 4140, width: 1634, height: 1417 }],
    "Focus Hatchback": [
      { years: "1998-2004", length: 4175, width: 1700, height: 1440 },
      { years: "2011-2018", length: 4358, width: 1823, height: 1484 },
      { years: "2019-2024", length: 4378, width: 1825, height: 1454 },
    ],
    Puma: [{ years: "2019-2026", length: 4186, width: 1805, height: 1537 }],
    "Figo Sedán": [
      { years: "2015-2021", length: 4254, width: 1695, height: 1525 },
    ],
    EcoSport: [
      { years: "2003-2012", length: 4240, width: 1734, height: 1629 },
      { years: "2013-2022", length: 4269, width: 1765, height: 1653 },
    ],
    Laser: [{ years: "1994-2002", length: 4340, width: 1695, height: 1420 }],
    "Bronco Sport": [
      { years: "2021-2026", length: 4387, width: 1887, height: 1783 },
    ],
    "Fiesta Sedán": [
      { years: "2011-2019", length: 4409, width: 1722, height: 1473 },
    ],
    "Transit Connect": [
      { years: "2013-2023", length: 4417, width: 1834, height: 1844 },
    ],
    Courier: [{ years: "1998-2013", length: 4457, width: 1770, height: 1477 }],
    Escape: [
      { years: "2001-2007", length: 4394, width: 1781, height: 1755 },
      { years: "2008-2012", length: 4437, width: 1806, height: 1720 },
      { years: "2013-2019", length: 4524, width: 1839, height: 1684 },
      { years: "2020-2026", length: 4585, width: 1882, height: 1679 },
    ],
    Territory: [
      { years: "2021-2026", length: 4630, width: 1935, height: 1706 },
    ],
    Mustang: [
      { years: "1994-2004", length: 4610, width: 1857, height: 1344 },
      { years: "2005-2014", length: 4775, width: 1877, height: 1407 },
      { years: "2015-2023", length: 4788, width: 1915, height: 1379 },
      { years: "2024-2026", length: 4811, width: 1915, height: 1397 },
    ],
    Edge: [
      { years: "2007-2014", length: 4717, width: 1925, height: 1702 },
      { years: "2015-2024", length: 4778, width: 1928, height: 1742 },
    ],
    "Mustang Mach-E": [
      { years: "2021-2026", length: 4713, width: 1881, height: 1597 },
    ],
    "Bronco (4 puertas)": [
      { years: "2021-2026", length: 4811, width: 1928, height: 1852 },
    ],
    Fusion: [
      { years: "2006-2012", length: 4831, width: 1834, height: 1453 },
      { years: "2013-2020", length: 4872, width: 1852, height: 1478 },
    ],
    Mondeo: [{ years: "2014-2022", length: 4871, width: 1852, height: 1482 }],
    Everest: [{ years: "2022-2026", length: 4914, width: 1923, height: 1841 }],
    Explorer: [
      { years: "1995-2001", length: 4788, width: 1783, height: 1702 },
      { years: "2002-2010", length: 4813, width: 1831, height: 1826 },
      { years: "2011-2019", length: 5006, width: 2004, height: 1788 },
      { years: "2020-2026", length: 5049, width: 2004, height: 1775 },
    ],
    Maverick: [{ years: "2022-2026", length: 5072, width: 1844, height: 1745 }],
    Flex: [{ years: "2009-2019", length: 5126, width: 1928, height: 1727 }],
    Taurus: [
      { years: "1996-2007", length: 5016, width: 1854, height: 1400 },
      { years: "2010-2019", length: 5154, width: 1935, height: 1542 },
    ],
    Ranger: [
      { years: "1998-2011", length: 5130, width: 1786, height: 1763 },
      { years: "2012-2022", length: 5359, width: 1850, height: 1815 },
      { years: "2023-2026", length: 5370, width: 1918, height: 1884 },
    ],
    Expedition: [
      { years: "2003-2017", length: 5245, width: 2000, height: 1961 },
      { years: "2018-2026", length: 5334, width: 2029, height: 1941 },
    ],
    "Crown Victoria": [
      { years: "1992-2011", length: 5385, width: 1963, height: 1443 },
    ],
    "Econoline (Standard)": [
      { years: "1992-2014", length: 5382, width: 2014, height: 2050 },
    ],
    "Expedition MAX": [
      { years: "2018-2026", length: 5636, width: 2029, height: 1938 },
    ],
    Excursion: [
      { years: "2000-2005", length: 5758, width: 2032, height: 1961 },
    ],
    "F-150 SuperCrew": [
      { years: "2015-2020", length: 5890, width: 2029, height: 1961 },
      { years: "2021-2026", length: 5885, width: 2030, height: 1960 },
    ],
    "Econoline (Extended)": [
      { years: "1992-2014", length: 5893, width: 2014, height: 2050 },
    ],
    "F-250 Super Duty": [
      { years: "2017-2026", length: 6350, width: 2032, height: 2070 },
    ],
    "F-350 / F-450 Dually": [
      { years: "2017-2026", length: 6761, width: 2438, height: 2057 },
    ],
  },

  Chevrolet: {
    Spark: [
      { years: "2010-2017", length: 3640, width: 1597, height: 1522 },
      { years: "2018-2022", length: 3636, width: 1595, height: 1483 },
    ],
    Beat: [{ years: "2018-2021", length: 3635, width: 1597, height: 1522 }],
    Corsa: [{ years: "2002-2009", length: 3822, width: 1646, height: 1432 }],
    "Sonic Hatchback": [
      { years: "2012-2020", length: 4039, width: 1735, height: 1517 },
    ],
    "Onix Hatchback": [
      { years: "2019-2026", length: 4160, width: 1730, height: 1471 },
    ],
    "Bolt EV": [
      { years: "2017-2023", length: 4166, width: 1765, height: 1595 },
    ],
    "Aveo Hatchback": [
      { years: "2024-2026", length: 4171, width: 1700, height: 1490 },
    ],
    Groove: [{ years: "2021-2026", length: 4220, width: 1740, height: 1615 }],
    Tracker: [
      { years: "2013-2019", length: 4248, width: 1775, height: 1674 },
      { years: "2020-2026", length: 4270, width: 1791, height: 1627 },
    ],
    "Bolt EUV": [
      { years: "2022-2026", length: 4305, width: 1770, height: 1616 },
    ],
    "Aveo Sedán": [
      { years: "2008-2017", length: 4310, width: 1710, height: 1505 },
      { years: "2018-2023", length: 4300, width: 1735, height: 1502 },
    ],
    "Sonic Sedán": [
      { years: "2012-2020", length: 4399, width: 1735, height: 1517 },
    ],
    "Trailblazer (Compacta)": [
      { years: "2021-2026", length: 4412, width: 1808, height: 1669 },
    ],
    N400: [{ years: "2020-2026", length: 4425, width: 1670, height: 1860 }],
    "Onix Sedán": [
      { years: "2019-2026", length: 4474, width: 1730, height: 1471 },
    ],
    Sail: [{ years: "2024-2026", length: 4490, width: 1735, height: 1490 }],
    Optra: [{ years: "2004-2013", length: 4500, width: 1725, height: 1445 }],
    Trax: [{ years: "2024-2026", length: 4537, width: 1823, height: 1560 }],
    Cruze: [
      { years: "2010-2015", length: 4597, width: 1788, height: 1477 },
      { years: "2016-2023", length: 4666, width: 1791, height: 1458 },
    ],
    Cavalier: [{ years: "2022-2026", length: 4614, width: 1798, height: 1485 }],
    Corvette: [
      { years: "1997-2004", length: 4564, width: 1869, height: 1212 },
      { years: "2005-2013", length: 4435, width: 1844, height: 1245 },
      { years: "2014-2019", length: 4493, width: 1872, height: 1240 },
      { years: "2020-2026", length: 4630, width: 1933, height: 1234 },
    ],
    Equinox: [
      { years: "2018-2024", length: 4652, width: 1843, height: 1661 },
      { years: "2025-2026", length: 4653, width: 1902, height: 1667 },
    ],
    Captiva: [{ years: "2019-2026", length: 4655, width: 1835, height: 1760 }],
    Montana: [{ years: "2023-2026", length: 4720, width: 1800, height: 1660 }],
    Camaro: [{ years: "2016-2024", length: 4783, width: 1897, height: 1349 }],
    "Equinox EV": [
      { years: "2024-2026", length: 4836, width: 1915, height: 1613 },
    ],
    "Blazer EV": [
      { years: "2024-2026", length: 4882, width: 1981, height: 1651 },
    ],
    "Trailblazer (Grande)": [
      { years: "2012-2024", length: 4887, width: 1902, height: 1840 },
    ],
    Blazer: [{ years: "2019-2026", length: 4917, width: 1948, height: 1702 }],
    Malibu: [{ years: "2016-2025", length: 4923, width: 1854, height: 1463 }],
    Impala: [{ years: "2014-2020", length: 5113, width: 1854, height: 1496 }],
    Traverse: [
      { years: "2018-2023", length: 5189, width: 1996, height: 1795 },
      { years: "2024-2026", length: 5194, width: 2012, height: 1776 },
    ],
    "S10 Max": [
      { years: "2022-2026", length: 5365, width: 1900, height: 1809 },
    ],
    Colorado: [
      { years: "2012-2022", length: 5347, width: 1882, height: 1817 },
      { years: "2023-2026", length: 5411, width: 1905, height: 1818 },
    ],
    Tahoe: [
      { years: "2015-2020", length: 5182, width: 2045, height: 1890 },
      { years: "2021-2026", length: 5352, width: 2057, height: 1925 },
    ],
    Avalanche: [
      { years: "2007-2013", length: 5621, width: 2009, height: 1836 },
    ],
    Suburban: [
      { years: "2015-2020", length: 5700, width: 2045, height: 1890 },
      { years: "2021-2026", length: 5733, width: 2057, height: 1923 },
    ],
    "Silverado 1500": [
      { years: "2019-2026", length: 5885, width: 2063, height: 1990 },
    ],
    "Express Van": [
      { years: "2003-2026", length: 6200, width: 2012, height: 2130 },
    ],
    "Silverado 2500HD": [
      { years: "2020-2026", length: 6351, width: 2079, height: 2030 },
    ],
    "Silverado 3500HD (Doble Rodaje)": [
      { years: "2020-2026", length: 6754, width: 2459, height: 2047 },
    ],
  },

  Jeep: {
    "Wrangler (2 puertas)": [
      { years: "1987-1995", length: 3880, width: 1680, height: 1750 },
      { years: "1997-2006", length: 3880, width: 1740, height: 1748 },
      { years: "2007-2017", length: 4223, width: 1873, height: 1800 },
      { years: "2018-2026", length: 4237, width: 1875, height: 1868 },
    ],
    Avenger: [{ years: "2023-2026", length: 4084, width: 1776, height: 1528 }],
    Renegade: [{ years: "2015-2026", length: 4232, width: 1803, height: 1689 }],
    "Wrangler Unlimited (4 puertas)": [
      { years: "2007-2017", length: 4751, width: 1877, height: 1800 },
      { years: "2018-2026", length: 4785, width: 1875, height: 1868 },
    ],
    Compass: [
      { years: "2007-2016", length: 4405, width: 1760, height: 1630 },
      { years: "2017-2026", length: 4394, width: 1819, height: 1635 },
    ],
    Patriot: [{ years: "2007-2017", length: 4410, width: 1755, height: 1635 }],
    Liberty: [
      { years: "2002-2007", length: 4437, width: 1819, height: 1796 },
      { years: "2008-2012", length: 4493, width: 1836, height: 1793 },
    ],
    Cherokee: [
      { years: "1984-2001", length: 4240, width: 1790, height: 1620 },
      { years: "2014-2023", length: 4623, width: 1859, height: 1667 },
    ],
    "Grand Cherokee": [
      { years: "1993-1998", length: 4500, width: 1760, height: 1710 },
      { years: "1999-2004", length: 4610, width: 1836, height: 1763 },
      { years: "2005-2010", length: 4740, width: 1869, height: 1720 },
      { years: "2011-2021", length: 4821, width: 1943, height: 1760 },
      { years: "2022-2026", length: 4915, width: 1968, height: 1798 },
    ],
    Commander: [
      { years: "2006-2010", length: 4788, width: 1899, height: 1826 },
    ],
    "Grand Cherokee L (3 Filas)": [
      { years: "2021-2026", length: 5204, width: 1963, height: 1816 },
    ],
    Wagoneer: [{ years: "2022-2026", length: 5453, width: 2123, height: 1920 }],
    "Grand Wagoneer": [
      { years: "2022-2026", length: 5453, width: 2123, height: 1920 },
    ],
    Gladiator: [
      { years: "2020-2026", length: 5537, width: 1875, height: 1857 },
    ],
    "Wagoneer L": [
      { years: "2023-2026", length: 5758, width: 2123, height: 1920 },
    ],
    "Grand Wagoneer L": [
      { years: "2023-2026", length: 5758, width: 2123, height: 1920 },
    ],
  },

  RAM: {
    700: [
      { years: "2014-2020", length: 4471, width: 1664, height: 1590 },
      { years: "2021-2026", length: 4474, width: 1732, height: 1595 },
    ],
    1000: [{ years: "2019-2026", length: 4945, width: 1844, height: 1735 }],
    "1500 Cabina Cuádruple": [
      { years: "2009-2018", length: 5817, width: 2017, height: 1900 },
      { years: "2019-2026", length: 5814, width: 2084, height: 1971 },
    ],
    "1500 Cabina Crew (Batea Corta)": [
      { years: "2009-2018", length: 5817, width: 2017, height: 1900 },
      { years: "2019-2026", length: 5916, width: 2084, height: 1971 },
    ],
    "1500 Cabina Crew (Batea Larga)": [
      { years: "2019-2026", length: 6142, width: 2084, height: 1971 },
    ],
    "1500 TRX": [
      { years: "2021-2024", length: 5916, width: 2235, height: 2055 },
    ],
    "2500 Heavy Duty (Cabina Crew)": [
      { years: "2010-2018", length: 6030, width: 2009, height: 1974 },
      { years: "2019-2026", length: 6066, width: 2120, height: 2037 },
    ],
    "2500 Heavy Duty (Mega Cabina)": [
      { years: "2010-2018", length: 6300, width: 2009, height: 1980 },
      { years: "2019-2026", length: 6348, width: 2120, height: 2037 },
    ],
    "3500 Doble Rodaje (Cabina Crew)": [
      { years: "2019-2026", length: 6066, width: 2438, height: 2045 },
    ],
    "3500 Doble Rodaje (Mega Cabina)": [
      { years: "2019-2026", length: 6348, width: 2438, height: 2045 },
    ],
    "V700 City": [
      { years: "2014-2021", length: 3950, width: 1716, height: 1890 },
    ],
    "V700 Rapid": [
      { years: "2017-2026", length: 4390, width: 1709, height: 1899 },
    ],
    ProMaster: [
      { years: "2014-2026", length: 5413, width: 2050, height: 2522 },
    ],
  },

  Hummer: {
    H1: [{ years: "1992-2006", length: 4686, width: 2197, height: 1905 }],
    H2: [{ years: "2003-2009", length: 5171, width: 2062, height: 2012 }],
    "H2 SUT Pickup": [
      { years: "2005-2009", length: 5171, width: 2062, height: 2012 },
    ],
    H3: [{ years: "2005-2010", length: 4778, width: 1897, height: 1872 }],
    "H3T Pickup": [
      { years: "2009-2010", length: 5403, width: 1908, height: 1831 },
    ],
    "EV SUV": [{ years: "2024-2026", length: 4999, width: 2197, height: 1918 }],
    "EV Pickup": [
      { years: "2022-2026", length: 5507, width: 2202, height: 2009 },
    ],
    HX: [{ years: "2008-2010", length: 4343, width: 2057, height: 1829 }],
  },

  Tesla: {
    "Model 2": [
      { years: "2025-2026", length: 4100, width: 1800, height: 1470 },
    ],
    "Model 3": [
      { years: "2017-2023", length: 4694, width: 1849, height: 1443 },
      { years: "2024-2026", length: 4720, width: 1848, height: 1441 },
    ],
    "Model Y": [
      { years: "2020-2026", length: 4751, width: 1921, height: 1624 },
    ],
    "Model S": [
      { years: "2012-2020", length: 4970, width: 1964, height: 1435 },
      { years: "2021-2026", length: 4970, width: 1964, height: 1445 },
    ],
    "Model X": [
      { years: "2016-2026", length: 5036, width: 1999, height: 1684 },
    ],
    Cybertruck: [
      { years: "2024-2026", length: 5682, width: 2032, height: 1791 },
    ],
    Roadster: [
      { years: "2008-2012", length: 3946, width: 1873, height: 1127 },
      { years: "2025-2026", length: 4300, width: 1880, height: 1300 },
    ],
  },

  GMC: {
    Terrain: [
      { years: "2010-2017", length: 4707, width: 1849, height: 1684 },
      { years: "2018-2024", length: 4630, width: 1839, height: 1661 },
      { years: "2025-2026", length: 4658, width: 1905, height: 1712 },
    ],
    Acadia: [
      { years: "2007-2016", length: 5108, width: 2002, height: 1775 },
      { years: "2017-2023", length: 4912, width: 1915, height: 1676 },
      { years: "2024-2026", length: 5179, width: 2022, height: 1826 },
    ],
    Envoy: [{ years: "2002-2009", length: 4867, width: 1897, height: 1826 }],
    "Envoy XL": [
      { years: "2002-2006", length: 5278, width: 1897, height: 1910 },
    ],
    Yukon: [
      { years: "2007-2014", length: 5131, width: 2007, height: 1953 },
      { years: "2015-2020", length: 5179, width: 2045, height: 1890 },
      { years: "2021-2026", length: 5334, width: 2057, height: 1943 },
    ],
    "Yukon XL": [
      { years: "2007-2014", length: 5644, width: 2009, height: 1951 },
      { years: "2015-2020", length: 5697, width: 2045, height: 1890 },
      { years: "2021-2026", length: 5720, width: 2057, height: 1943 },
    ],
    Canyon: [
      { years: "2004-2012", length: 4887, width: 1717, height: 1651 },
      { years: "2015-2022", length: 5395, width: 1887, height: 1793 },
      { years: "2023-2026", length: 5415, width: 1905, height: 2024 },
    ],
    "Sierra 1500 Cabina Sencilla": [
      { years: "2019-2026", length: 5354, width: 2063, height: 1920 },
    ],
    "Sierra 1500 Cabina Crew": [
      { years: "2014-2018", length: 5815, width: 2032, height: 1877 },
      { years: "2019-2026", length: 5885, width: 2063, height: 1917 },
    ],
    "Sierra 2500 Heavy Duty": [
      { years: "2020-2026", length: 6351, width: 2079, height: 2027 },
    ],
    "Sierra 3500 Heavy Duty": [
      { years: "2020-2026", length: 6351, width: 2079, height: 2027 },
    ],
    "Sierra 3500 Doble Rodaje": [
      { years: "2020-2026", length: 6754, width: 2459, height: 2047 },
    ],
    "Savana Van": [
      { years: "2003-2026", length: 5692, width: 2012, height: 2073 },
    ],
    "Savana Van Extendida": [
      { years: "2003-2026", length: 6200, width: 2012, height: 2130 },
    ],
  },

  Cadillac: {
    XT4: [{ years: "2019-2026", length: 4595, width: 1882, height: 1605 }],
    XT5: [{ years: "2017-2026", length: 4816, width: 1902, height: 1676 }],
    CT4: [{ years: "2020-2026", length: 4755, width: 1814, height: 1422 }],
    CT5: [{ years: "2020-2026", length: 4923, width: 1882, height: 1453 }],
    CTS: [
      { years: "2003-2007", length: 4829, width: 1793, height: 1440 },
      { years: "2008-2013", length: 4859, width: 1841, height: 1473 },
      { years: "2014-2019", length: 4966, width: 1834, height: 1453 },
    ],
    STS: [{ years: "2005-2011", length: 4986, width: 1844, height: 1463 }],
    Lyriq: [{ years: "2023-2026", length: 4996, width: 1976, height: 1623 }],
    XT6: [{ years: "2020-2026", length: 5050, width: 1963, height: 1775 }],
    DTS: [{ years: "2006-2011", length: 5273, width: 1895, height: 1463 }],
    Escalade: [
      { years: "2002-2006", length: 5052, width: 2004, height: 1897 },
      { years: "2007-2014", length: 5144, width: 2007, height: 1887 },
      { years: "2015-2020", length: 5179, width: 2045, height: 1890 },
      { years: "2021-2026", length: 5382, width: 2057, height: 1948 },
    ],
    "Escalade ESV": [
      { years: "2007-2014", length: 5662, width: 2009, height: 1895 },
      { years: "2015-2020", length: 5697, width: 2045, height: 1890 },
      { years: "2021-2026", length: 5766, width: 2057, height: 1941 },
    ],
    "Escalade EXT Pickup": [
      { years: "2002-2006", length: 5624, width: 2017, height: 1895 },
      { years: "2007-2013", length: 5639, width: 2009, height: 1887 },
    ],
  },

  Dodge: {
    Colt: [{ years: "1989-1994", length: 3995, width: 1670, height: 1321 }],
    "Attitude Hatchback": [
      { years: "2015-2024", length: 4244, width: 1669, height: 1514 },
    ],
    "Attitude Sedán": [
      { years: "2006-2011", length: 4280, width: 1694, height: 1471 },
      { years: "2025-2026", length: 4700, width: 1850, height: 1489 },
    ],
    Shadow: [{ years: "1987-1994", length: 4364, width: 1709, height: 1341 }],
    Neon: [
      { years: "1995-1999", length: 4340, width: 1710, height: 1390 },
      { years: "2000-2005", length: 4430, width: 1710, height: 1420 },
      { years: "2017-2021", length: 4532, width: 1792, height: 1497 },
    ],
    Caliber: [{ years: "2007-2012", length: 4415, width: 1800, height: 1535 }],
    "Viper RT 10": [
      { years: "1992-2002", length: 4448, width: 1923, height: 1118 },
    ],
    "Viper GTS": [
      { years: "1996-2002", length: 4488, width: 1923, height: 1194 },
      { years: "2013-2017", length: 4463, width: 1941, height: 1247 },
    ],
    Cavalier: [{ years: "1995-2005", length: 4500, width: 1710, height: 1350 }],
    Hornet: [{ years: "2023-2026", length: 4528, width: 1836, height: 1620 }],
    Stealth: [{ years: "1991-1996", length: 4545, width: 1840, height: 1285 }],
    Nitro: [{ years: "2007-2012", length: 4584, width: 1857, height: 1773 }],
    Spirit: [{ years: "1989-1995", length: 4602, width: 1730, height: 1359 }],
    Dart: [{ years: "2013-2016", length: 4671, width: 1830, height: 1466 }],
    Journey: [
      { years: "2022-2026", length: 4695, width: 1870, height: 1691 },
      { years: "2009-2020", length: 4887, width: 1834, height: 1692 },
    ],
    Stratus: [
      { years: "1995-2000", length: 4724, width: 1803, height: 1374 },
      { years: "2001-2006", length: 4856, width: 1793, height: 1394 },
    ],
    Caravan: [
      { years: "1984-1995", length: 4468, width: 1830, height: 1640 },
      { years: "1996-2000", length: 4730, width: 1920, height: 1740 },
      { years: "2001-2007", length: 4808, width: 1996, height: 1750 },
    ],
    Avenger: [
      { years: "1995-2000", length: 4755, width: 1750, height: 1346 },
      { years: "2008-2014", length: 4850, width: 1841, height: 1491 },
    ],
    Challenger: [
      { years: "1970-1974", length: 4860, width: 1930, height: 1290 },
      { years: "2008-2023", length: 5027, width: 1923, height: 1460 },
    ],
    "Ram Van (Corta)": [
      { years: "1971-2003", length: 4882, width: 2002, height: 2024 },
    ],
    Durango: [
      { years: "1998-2003", length: 4910, width: 1816, height: 1854 },
      { years: "2004-2009", length: 5100, width: 1930, height: 1897 },
      { years: "2011-2026", length: 5110, width: 1925, height: 1801 },
    ],
    Magnum: [{ years: "2005-2008", length: 5022, width: 1882, height: 1481 }],
    Charger: [
      { years: "2011-2023", length: 5040, width: 1905, height: 1478 },
      { years: "2006-2010", length: 5082, width: 1891, height: 1478 },
      { years: "2024-2026", length: 5248, width: 2022, height: 1499 },
    ],
    "Grand Caravan": [
      { years: "1987-1995", length: 4880, width: 1830, height: 1640 },
      { years: "1996-2000", length: 5070, width: 1920, height: 1740 },
      { years: "2001-2007", length: 5093, width: 1996, height: 1750 },
      { years: "2008-2020", length: 5144, width: 1953, height: 1750 },
    ],
    Intrepid: [
      { years: "1993-1997", length: 5123, width: 1890, height: 1430 },
      { years: "1998-2004", length: 5174, width: 1897, height: 1420 },
    ],
    "Charger ": [
      { years: "1966-1970", length: 5296, width: 1948, height: 1350 },
    ],
    "Ram Van (Larga)": [
      { years: "1971-2003", length: 5872, width: 2002, height: 2024 },
    ],
  },

  Lincoln: {
    "Mark VII": [
      { years: "1984-1992", length: 5151, width: 1801, height: 1377 },
    ],
    MKC: [{ years: "2015-2019", length: 4552, width: 1864, height: 1656 }],
    Corsair: [{ years: "2020-2026", length: 4587, width: 1887, height: 1628 }],
    MKX: [
      { years: "2007-2015", length: 4735, width: 1925, height: 1715 },
      { years: "2016-2018", length: 4826, width: 1933, height: 1681 },
    ],
    Nautilus: [
      { years: "2019-2023", length: 4826, width: 1933, height: 1681 },
      { years: "2024-2026", length: 4907, width: 1946, height: 1717 },
    ],
    MKZ: [
      { years: "2007-2012", length: 4839, width: 1834, height: 1453 },
      { years: "2013-2020", length: 4930, width: 1864, height: 1476 },
    ],
    LS: [{ years: "2000-2006", length: 4925, width: 1859, height: 1422 }],
    "Mark VIII": [
      { years: "1993-1998", length: 5265, width: 1895, height: 1361 },
    ],
    Aviator: [
      { years: "2003-2005", length: 4910, width: 1877, height: 1826 },
      { years: "2020-2026", length: 5062, width: 2022, height: 1768 },
    ],
    Continental: [
      { years: "1988-1994", length: 5210, width: 1857, height: 1412 },
      { years: "1995-2002", length: 5304, width: 1870, height: 1420 },
      { years: "2017-2020", length: 5116, width: 1913, height: 1486 },
    ],
    MKS: [{ years: "2009-2016", length: 5184, width: 1928, height: 1565 }],
    Navigator: [
      { years: "1998-2002", length: 5202, width: 2027, height: 1948 },
      { years: "2003-2006", length: 5232, width: 2037, height: 1976 },
      { years: "2007-2017", length: 5293, width: 2002, height: 1984 },
      { years: "2018-2026", length: 5334, width: 2029, height: 1938 },
    ],
    MKT: [{ years: "2010-2019", length: 5273, width: 1930, height: 1712 }],
    "Town Car": [
      { years: "1990-1997", length: 5560, width: 1953, height: 1440 },
      { years: "1998-2011", length: 5471, width: 1986, height: 1499 },
    ],
    "Town Car Cartier L": [
      { years: "2001-2011", length: 5624, width: 1986, height: 1501 },
    ],
    "Blackwood Pickup": [
      { years: "2002", length: 5610, width: 1980, height: 1870 },
    ],
    "Mark LT Pickup": [
      { years: "2006-2008", length: 5685, width: 2004, height: 1880 },
      { years: "2010-2014", length: 5620, width: 2012, height: 1920 },
    ],
    "Navigator L Extendida": [
      { years: "2007-2017", length: 5672, width: 2002, height: 1981 },
      { years: "2018-2026", length: 5636, width: 2029, height: 1933 },
    ],
  },

  Chrysler: {
    Crossfire: [
      { years: "2004-2008", length: 4059, width: 1765, height: 1303 },
    ],
    Attitude: [{ years: "2006-2011", length: 4280, width: 1694, height: 1471 }],
    "PT Cruiser": [
      { years: "2001-2010", length: 4288, width: 1704, height: 1600 },
    ],
    Neon: [
      { years: "1995-1999", length: 4340, width: 1710, height: 1390 },
      { years: "2000-2005", length: 4430, width: 1710, height: 1420 },
    ],
    "LeBaron Sedán": [
      { years: "1982-1988", length: 4564, width: 1727, height: 1346 },
    ],
    Cirrus: [{ years: "1995-2000", length: 4724, width: 1803, height: 1374 }],
    Sebring: [
      { years: "1995-2000", length: 4750, width: 1750, height: 1346 },
      { years: "2001-2006", length: 4844, width: 1793, height: 1394 },
      { years: "2007-2010", length: 4841, width: 1808, height: 1499 },
    ],
    "200 Sedán": [
      { years: "2011-2014", length: 4870, width: 1841, height: 1483 },
      { years: "2015-2017", length: 4884, width: 1871, height: 1491 },
    ],
    "300 Sedán": [
      { years: "2005-2010", length: 4999, width: 1880, height: 1483 },
      { years: "2011-2023", length: 5044, width: 1902, height: 1485 },
    ],
    "300M": [{ years: "1999-2004", length: 5024, width: 1890, height: 1422 }],
    Concorde: [
      { years: "1993-1997", length: 5151, width: 1890, height: 1430 },
      { years: "1998-2004", length: 5311, width: 1892, height: 1420 },
    ],
    LHS: [
      { years: "1994-1997", length: 5268, width: 1890, height: 1412 },
      { years: "1999-2001", length: 5136, width: 1892, height: 1422 },
    ],
    Aspen: [{ years: "2007-2009", length: 5100, width: 1930, height: 1887 }],
    "Town y Country": [
      { years: "1990-1995", length: 4897, width: 1830, height: 1640 },
      { years: "1996-2000", length: 5070, width: 1920, height: 1740 },
      { years: "2001-2007", length: 5093, width: 1996, height: 1750 },
      { years: "2008-2016", length: 5144, width: 1953, height: 1750 },
    ],
    Pacifica: [
      { years: "2004-2008", length: 5052, width: 2014, height: 1689 },
      { years: "2017-2026", length: 5176, width: 2022, height: 1775 },
    ],
    Voyager: [{ years: "2020-2026", length: 5176, width: 2022, height: 1775 }],
    Imperial: [{ years: "1990-1993", length: 5156, width: 1750, height: 1380 }],
  },

  Buick: {
    Encore: [{ years: "2013-2022", length: 4277, width: 1775, height: 1646 }],
    "Encore GX": [
      { years: "2020-2026", length: 4346, width: 1814, height: 1621 },
    ],
    Skyhawk: [{ years: "1982-1989", length: 4400, width: 1650, height: 1350 }],
    Envista: [{ years: "2024-2026", length: 4638, width: 1816, height: 1557 }],
    Envision: [
      { years: "2016-2020", length: 4666, width: 1839, height: 1697 },
      { years: "2021-2026", length: 4636, width: 1882, height: 1641 },
    ],
    Verano: [{ years: "2012-2017", length: 4671, width: 1814, height: 1476 }],
    Skylark: [{ years: "1992-1998", length: 4790, width: 1740, height: 1350 }],
    Regal: [
      { years: "1997-2004", length: 4983, width: 1847, height: 1438 },
      { years: "2011-2017", length: 4831, width: 1857, height: 1483 },
      { years: "2018-2020", length: 4895, width: 1864, height: 1455 },
    ],
    "Century ": [
      { years: "1997-2005", length: 4943, width: 1847, height: 1438 },
    ],
    LaCrosse: [
      { years: "2005-2009", length: 5032, width: 1854, height: 1463 },
      { years: "2010-2016", length: 5001, width: 1857, height: 1496 },
      { years: "2017-2019", length: 5017, width: 1859, height: 1461 },
    ],
    LeSabre: [{ years: "2000-2005", length: 5080, width: 1867, height: 1448 }],
    Lucerne: [{ years: "2006-2011", length: 5161, width: 1875, height: 1473 }],
    Enclave: [
      { years: "2008-2017", length: 5126, width: 2007, height: 1842 },
      { years: "2018-2024", length: 5189, width: 2002, height: 1775 },
      { years: "2025-2026", length: 5195, width: 2022, height: 1803 },
    ],
    "Park Avenue": [
      { years: "1991-1996", length: 5212, width: 1902, height: 1405 },
      { years: "1997-2005", length: 5253, width: 1897, height: 1458 },
    ],
    Rainier: [{ years: "2004-2007", length: 4869, width: 1897, height: 1895 }],
    Terraza: [{ years: "2005-2007", length: 5202, width: 1829, height: 1826 }],
  },

  Pontiac: {
    Solstice: [{ years: "2006-2010", length: 3993, width: 1811, height: 1273 }],
    Vibe: [
      { years: "2003-2008", length: 4350, width: 1775, height: 1540 },
      { years: "2009-2010", length: 4371, width: 1763, height: 1547 },
    ],
    Aztek: [{ years: "2001-2005", length: 4623, width: 1872, height: 1694 }],
    "Grand Am": [
      { years: "1999-2005", length: 4732, width: 1788, height: 1395 },
    ],
    G6: [{ years: "2005-2010", length: 4803, width: 1788, height: 1450 }],
    GTO: [{ years: "2004-2006", length: 4821, width: 1842, height: 1394 }],
    Firebird: [{ years: "1993-2002", length: 4910, width: 1892, height: 1321 }],
    "Grand Prix": [
      { years: "1997-2003", length: 4991, width: 1847, height: 1389 },
      { years: "2004-2008", length: 5037, width: 1869, height: 1415 },
    ],
    Montana: [{ years: "1999-2005", length: 5110, width: 1847, height: 1715 }],
    Bonneville: [
      { years: "2000-2005", length: 5146, width: 1885, height: 1438 },
    ],
  },

  Saturn: {
    Sky: [{ years: "2007-2010", length: 4092, width: 1814, height: 1273 }],
    "Ion Hatchback": [
      { years: "2003-2007", length: 4536, width: 1725, height: 1415 },
    ],
    "Ion Sedán": [
      { years: "2003-2007", length: 4686, width: 1707, height: 1458 },
    ],
    Vue: [
      { years: "2008-2010", length: 4575, width: 1852, height: 1704 },
      { years: "2002-2007", length: 4605, width: 1816, height: 1689 },
    ],
    "L Series": [
      { years: "2000-2005", length: 4836, width: 1750, height: 1422 },
    ],
    Aura: [{ years: "2007-2010", length: 4851, width: 1786, height: 1463 }],
    Outlook: [{ years: "2007-2010", length: 5100, width: 1991, height: 1773 }],
  },

  Mercury: {
    Mariner: [{ years: "2005-2011", length: 4442, width: 1781, height: 1720 }],
    Villager: [{ years: "1993-2002", length: 4823, width: 1900, height: 1730 }],
    Mountaineer: [
      { years: "1997-2001", length: 4831, width: 1783, height: 1803 },
      { years: "2002-2010", length: 4910, width: 1872, height: 1826 },
    ],
    Milan: [{ years: "2006-2011", length: 4862, width: 1834, height: 1445 }],
    Sable: [
      { years: "1996-2005", length: 5072, width: 1854, height: 1402 },
      { years: "2008-2009", length: 5133, width: 1892, height: 1562 },
    ],
    Montego: [{ years: "2005-2007", length: 5090, width: 1892, height: 1562 }],
    "Grand Marquis": [
      { years: "1998-2011", length: 5382, width: 1986, height: 1443 },
      { years: "1992-1997", length: 5395, width: 1968, height: 1440 },
    ],
  },

  Oldsmobile: {
    Bravada: [
      { years: "1996-2001", length: 4600, width: 1710, height: 1610 },
      { years: "2002-2004", length: 4870, width: 1897, height: 1895 },
    ],
    Alero: [{ years: "1999-2004", length: 4742, width: 1781, height: 1410 }],
    Cutlass: [{ years: "1997-1999", length: 4877, width: 1750, height: 1420 }],
    Intrigue: [{ years: "1998-2002", length: 4983, width: 1869, height: 1438 }],
    Silhouette: [
      { years: "1997-2004", length: 5113, width: 1847, height: 1712 },
    ],
    Aurora: [{ years: "1995-2003", length: 5116, width: 1890, height: 1420 }],
  },

  Plymouth: {
    Prowler: [{ years: "1997-2002", length: 4191, width: 1943, height: 1293 }],
    Neon: [{ years: "1995-2001", length: 4340, width: 1710, height: 1390 }],
    Breeze: [{ years: "1996-2000", length: 4724, width: 1803, height: 1374 }],
    Voyager: [{ years: "1996-2000", length: 4730, width: 1920, height: 1740 }],
    "Grand Voyager": [
      { years: "1996-2000", length: 5070, width: 1920, height: 1740 },
    ],
  },

  Rivian: {
    R3: [{ years: "2026", length: 4320, width: 1900, height: 1560 }],
    R2: [{ years: "2026", length: 4715, width: 1905, height: 1700 }],
    R1S: [{ years: "2022-2026", length: 5100, width: 2014, height: 1816 }],
    R1T: [{ years: "2022-2026", length: 5514, width: 2014, height: 1816 }],
  },

  Lucid: {
    Air: [{ years: "2022-2026", length: 4976, width: 1938, height: 1410 }],
    Gravity: [{ years: "2025-2026", length: 5034, width: 1999, height: 1656 }],
  },

  Shelby: {
    "Series 1": [
      { years: "1998-2005", length: 4293, width: 1943, height: 1194 },
    ],
    "GT350 / GT500": [
      { years: "2015-2022", length: 4810, width: 1920, height: 1380 },
    ],
    "F-150 Super Snake": [
      { years: "2017-2026", length: 5890, width: 2030, height: 1920 },
    ],
  },

  //==================
  //    CHINESE
  //==================
  BYD: {
    Seagull: [{ years: "2024-2026", length: 3780, width: 1715, height: 1540 }],
    Dolphin: [
      { years: "2023-2025", length: 4125, width: 1770, height: 1570 },
      { years: "2026", length: 4290, width: 1770, height: 1570 },
    ],
    "Yuan Pro": [
      { years: "2021-2026", length: 4375, width: 1785, height: 1680 },
    ],
    "Yuan Plus": [
      { years: "2022-2026", length: 4455, width: 1875, height: 1615 },
    ],
    Song: [{ years: "2021-2026", length: 4705, width: 1890, height: 1680 }],
    "Song Plus": [
      { years: "2024-2026", length: 4775, width: 1890, height: 1670 },
    ],
    Seal: [{ years: "2023-2026", length: 4800, width: 1875, height: 1460 }],
    Tang: [{ years: "2019-2026", length: 4870, width: 1950, height: 1725 }],
    Han: [{ years: "2021-2026", length: 4995, width: 1910, height: 1495 }],
    Shark: [{ years: "2025-2026", length: 5457, width: 1971, height: 1925 }],
  },

  MG: {
    MG3: [
      { years: "2013-2023", length: 4018, width: 1729, height: 1507 },
      { years: "2024-2026", length: 4113, width: 1797, height: 1502 },
    ],
    MG4: [{ years: "2023-2026", length: 4287, width: 1836, height: 1504 }],
    ZS: [{ years: "2017-2026", length: 4323, width: 1809, height: 1653 }],
    ZX: [{ years: "2021-2026", length: 4323, width: 1809, height: 1653 }],
    Cyberster: [
      { years: "2024-2026", length: 4535, width: 1913, height: 1329 },
    ],
    HS: [{ years: "2020-2026", length: 4574, width: 1876, height: 1664 }],
    EHS: [{ years: "2021-2026", length: 4574, width: 1876, height: 1664 }],
    GT: [{ years: "2022-2026", length: 4675, width: 1842, height: 1473 }],
    MG5: [{ years: "2021-2026", length: 4675, width: 1842, height: 1473 }],
    RX8: [{ years: "2021-2025", length: 4923, width: 1930, height: 1840 }],
  },

  Omoda: {
    C3: [{ years: "2024-2026", length: 4000, width: 1760, height: 1580 }],
    C5: [{ years: "2023-2026", length: 4400, width: 1830, height: 1588 }],
    C7: [{ years: "2025-2026", length: 4621, width: 1872, height: 1673 }],
  },

  Jaecoo: {
    J5: [{ years: "2025-2026", length: 4338, width: 1830, height: 1641 }],
    J7: [{ years: "2024-2026", length: 4500, width: 1865, height: 1680 }],
    J8: [{ years: "2024-2026", length: 4820, width: 1930, height: 1699 }],
  },

  Jetour: {
    Dashing: [{ years: "2023-2026", length: 4590, width: 1900, height: 1685 }],
    X70: [
      { years: "2020-2023", length: 4720, width: 1900, height: 1710 },
      { years: "2024-2026", length: 4743, width: 1900, height: 1720 },
    ],
    X90: [{ years: "2022-2026", length: 4858, width: 1925, height: 1780 }],
    T2: [{ years: "2024-2026", length: 4785, width: 2006, height: 1880 }],
  },

  Geely: {
    GX3: [{ years: "2018-2026", length: 4005, width: 1760, height: 1575 }],
    Coolray: [{ years: "2020-2026", length: 4330, width: 1800, height: 1609 }],
    Geometry: [
      { years: "2021-2023", length: 4432, width: 1833, height: 1560 }, // Geometry C
      { years: "2024-2026", length: 4615, width: 1901, height: 1670 }, // EX5
    ],
    Azkarra: [{ years: "2021-2025", length: 4544, width: 1831, height: 1713 }],
    Okavango: [{ years: "2021-2026", length: 4835, width: 1900, height: 1785 }],
    Monjaro: [{ years: "2023-2026", length: 4770, width: 1895, height: 1689 }],
  },

  Chery: {
    "Tiggo 2": [
      { years: "2017-2026", length: 4200, width: 1760, height: 1570 },
    ],
    "Tiggo 4": [
      { years: "2019-2026", length: 4318, width: 1830, height: 1670 },
    ],
    "Tiggo 7": [
      { years: "2020-2026", length: 4500, width: 1842, height: 1746 },
    ],
    "Tiggo 8": [
      { years: "2019-2026", length: 4724, width: 1860, height: 1745 },
    ],
    "Arrizo 5": [
      { years: "2016-2023", length: 4572, width: 1825, height: 1482 },
    ],
  },

  GWM: {
    "Ora 03": [{ years: "2023-2026", length: 4235, width: 1825, height: 1603 }],
    Jolion: [{ years: "2021-2026", length: 4472, width: 1841, height: 1619 }],
    "Haval H6": [
      { years: "2021-2026", length: 4653, width: 1886, height: 1730 },
    ],
    "Tank 300": [{ years: "2024-2026", length: 4760, width: 1930, height: 1903 }],
    "Tank 500": [{ years: "2024-2026", length: 5078, width: 1934, height: 1905 }],
    Poer: [{ years: "2021-2026", length: 5410, width: 1934, height: 1886 }],
  },

  Aion: {
    Y: [{ years: "2023-2026", length: 4535, width: 1870, height: 1650 }],
    V: [{ years: "2024-2026", length: 4605, width: 1854, height: 1686 }],
    LX: [{ years: "2024-2026", length: 4835, width: 1935, height: 1685 }],
  },

  Neta: {
    V: [{ years: "2023-2026", length: 4070, width: 1690, height: 1540 }],
    AYA: [{ years: "2024-2026", length: 4070, width: 1690, height: 1540 }],
    X: [{ years: "2025-2026", length: 4619, width: 1860, height: 1628 }],
    GT: [{ years: "2024-2026", length: 4715, width: 1979, height: 1415 }],
  },

  JAC: {
    JS2: [{ years: "2016-2026", length: 4135, width: 1750, height: 1550 }],
    JS3: [{ years: "2017-2025", length: 4345, width: 1765, height: 1640 }],
    JS4: [{ years: "2020-2026", length: 4410, width: 1800, height: 1660 }],
    JS6: [{ years: "2022-2026", length: 4605, width: 1890, height: 1700 }],
    JS8: [{ years: "2021-2026", length: 4810, width: 1870, height: 1758 }],
    T6: [{ years: "2016-2024", length: 5315, width: 1830, height: 1815 }],
    T8: [{ years: "2019-2026", length: 5325, width: 1880, height: 1830 }],
  },

  Haval: {
    Jolion: [{ years: "2021-2026", length: 4472, width: 1841, height: 1619 }],
    Dargo: [{ years: "2022-2026", length: 4620, width: 1890, height: 1780 }],
    H6: [{ years: "2021-2026", length: 4653, width: 1886, height: 1730 }],
    Raptor: [{ years: "2024-2026", length: 4680, width: 1916, height: 1822 }],
    "H6 GT": [{ years: "2023-2026", length: 4727, width: 1940, height: 1729 }],
  },

  DFSK: {
    "Glory 500": [
      { years: "2021-2026", length: 4385, width: 1850, height: 1645 },
    ],
    "Glory 560": [
      { years: "2018-2025", length: 4515, width: 1815, height: 1735 },
    ],
    "Glory 580": [
      { years: "2017-2026", length: 4680, width: 1845, height: 1715 },
    ],
    "Glory 600": [
      { years: "2024-2026", length: 4720, width: 1900, height: 1785 },
    ],
    E5: [{ years: "2024-2026", length: 4760, width: 1865, height: 1710 }],
  },

  Maxus: {
    D60: [{ years: "2021-2026", length: 4720, width: 1860, height: 1736 }],
    D90: [{ years: "2019-2026", length: 5005, width: 1932, height: 1875 }],
    G10: [{ years: "2016-2025", length: 5168, width: 1980, height: 1928 }],
    T60: [{ years: "2017-2026", length: 5365, width: 1900, height: 1809 }],
    T90: [{ years: "2022-2026", length: 5365, width: 1900, height: 1845 }],
    V80: [{ years: "2015-2026", length: 5700, width: 1998, height: 2345 }],
  },

  Foton: {
    Gratour: [{ years: "2016-2023", length: 3915, width: 1725, height: 1845 }],
    Tunland: [{ years: "2012-2020", length: 5310, width: 1880, height: 1860 }],
    "Tunland G7": [
      { years: "2021-2026", length: 5340, width: 1940, height: 1870 },
    ],
    "Tunland G9": [
      { years: "2022-2026", length: 5340, width: 1940, height: 1870 },
    ],
    View: [{ years: "2015-2026", length: 5320, width: 1695, height: 2280 }],
  },

  Zeekr: {
    X: [{ years: "2024-2026", length: 4450, width: 1836, height: 1572 }],
    "001": [{ years: "2023-2026", length: 4970, width: 1999, height: 1560 }],
    "009": [{ years: "2024-2026", length: 5209, width: 2024, height: 1848 }],
  },

  Deepal: {
    S07: [{ years: "2024-2026", length: 4750, width: 1930, height: 1625 }],
    L07: [{ years: "2024-2026", length: 4820, width: 1890, height: 1480 }],
    G318: [{ years: "2025-2026", length: 5010, width: 1985, height: 1960 }],
  },

  Exeed: {
    LX: [{ years: "2022-2026", length: 4533, width: 1848, height: 1699 }],
    TXL: [{ years: "2022-2026", length: 4780, width: 1885, height: 1730 }],
    VX: [{ years: "2022-2026", length: 4970, width: 1940, height: 1788 }],
  },

  Changan: {
    CS15: [{ years: "2016-2026", length: 4135, width: 1740, height: 1630 }],
    CS35: [{ years: "2019-2026", length: 4335, width: 1825, height: 1660 }],
    CS55: [{ years: "2021-2026", length: 4515, width: 1865, height: 1680 }],
    "Uni-T": [{ years: "2021-2026", length: 4515, width: 1870, height: 1565 }],
    "Uni-K": [{ years: "2022-2026", length: 4865, width: 1948, height: 1695 }],
    Hunter: [{ years: "2020-2026", length: 5330, width: 1930, height: 1835 }],
  },

  GAC: {
    Emzoom: [{ years: "2024-2026", length: 4410, width: 1850, height: 1600 }],
    Emkoo: [{ years: "2024-2026", length: 4680, width: 1901, height: 1670 }],
    GS8: [{ years: "2022-2026", length: 4980, width: 1950, height: 1780 }],
  },

  BAIC: {
    X3: [{ years: "2019-2026", length: 4325, width: 1830, height: 1640 }],
    X35: [{ years: "2016-2024", length: 4325, width: 1830, height: 1640 }],
    X55: [{ years: "2017-2023", length: 4480, width: 1837, height: 1680 }],
    "X55 II": [{ years: "2023-2026", length: 4620, width: 1886, height: 1680 }],
    BJ40: [{ years: "2014-2026", length: 4630, width: 1925, height: 1871 }],
    X7: [{ years: "2020-2026", length: 4710, width: 1892, height: 1715 }],
  },

  Soueast: {
    DX3: [{ years: "2016-2026", length: 4354, width: 1840, height: 1670 }],
    DX5: [{ years: "2019-2024", length: 4406, width: 1840, height: 1654 }],
    DX7: [{ years: "2015-2026", length: 4585, width: 1900, height: 1718 }],
  },

  JMC: {
    Vigus: [
      { years: "2016-2021", length: 5325, width: 1810, height: 1810 },
      { years: "2022-2026", length: 5375, width: 1905, height: 1835 } // Vigus Pro
    ],
    Grand: [{ years: "2024-2026", length: 5435, width: 1935, height: 1870 }],
  },

  Karry: {
    Q22: [{ years: "2012-2026", length: 3998, width: 1515, height: 1830 }],
    "Yoyo / Van": [{ years: "2015-2026", length: 4430, width: 1626, height: 1930 }],
  },

  Karva: {
    K1: [{ years: "2022-2026", length: 4335, width: 1825, height: 1660 }],
    K2: [{ years: "2022-2026", length: 4515, width: 1865, height: 1680 }],
  },

  Bestune: {
    T33: [{ years: "2019-2024", length: 4330, width: 1810, height: 1640 }],
    T77: [{ years: "2019-2026", length: 4525, width: 1845, height: 1615 }],
    T99: [{ years: "2020-2026", length: 4800, width: 1915, height: 1685 }],
  },

  Dongfeng: {
    Nano: [{ years: "2024-2026", length: 4030, width: 1810, height: 1570 }],
    AX7: [{ years: "2015-2026", length: 4660, width: 1880, height: 1690 }],
    "Rich 6": [{ years: "2019-2026", length: 5290, width: 1850, height: 1810 }],
    "Rich 7": [{ years: "2022-2026", length: 5290, width: 1910, height: 1875 }],
  },
};

async function seedVehicleCatalog() {
  console.log("Seeding vehicle catalog with detailed dimensions...");
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

  // Step 4: Batch insert all variants
  const VARIANT_BATCH_SIZE = 1000;
  for (let i = 0; i < variantsToCreate.length; i += VARIANT_BATCH_SIZE) {
    const batch = variantsToCreate.slice(i, i + VARIANT_BATCH_SIZE);
    await prisma.vehicleModelVariant.createMany({
      data: batch,
      skipDuplicates: true,
    });
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`Seeded ${totalMakes} makes, ${totalModels} models, and ${totalVariants} variants in ${duration}s.`);
}

async function main() {
  const passwordHash = await bcrypt.hash("Parkit123!", 10);

  // Flow: SUPER_ADMIN creates companies via API, picks one in the company selector (x-company-id),
  // and everything created afterward (users, parkings, etc.) is linked to that company.
  await prisma.user.upsert({
    where: { email: "superadmin@parkit.cr" },
    update: {
      companyId: null,
      firstName: "Parkit",
      lastName: "Admin",
      passwordHash,
      systemRole: "SUPER_ADMIN",
      timezone: "UTC",
      isActive: true,
    },
    create: {
      id: "b8e5d9b5-6g35-5c77-0g95-d6ec1g9f7b12",
      companyId: null,
      firstName: "Parkit",
      lastName: "Admin",
      email: "superadmin@parkit.cr",
      passwordHash,
      systemRole: "SUPER_ADMIN",
      timezone: "UTC",
      isActive: true,
    },
  });

  // Seed banks and cards
  await seedBanksAndCards();

  // Seed vehicle catalog
  await seedVehicleCatalog();
}

async function seedBanksAndCards() {
  console.log("Seeding banks and cards...");

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

  console.log(`Seeded ${banks.length} banks and ${cards.length} cards.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Seed completed successfully.");
  })
  .catch(async (error) => {
    console.error("Seed failed:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
