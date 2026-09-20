// Verified word/POS levels, not card positions. Sources and update procedure: docs/WORD_LEVELS.md.
const WordLevels = (() => {
  const data = {
  "checkedAt": "2026-09-21",
  "sources": {
    "oxford3000": {
      "title": "Oxford 3000",
      "url": "https://www.oxfordlearnersdictionaries.com/external/pdf/wordlists/oxford-3000-5000/The_Oxford_3000.pdf",
      "sha256": "ddaf936ef29f5e67c2df0ab3b547fd5bf9d9631f900c3cf55c195cb9c5ad0b40"
    },
    "oxford5000": {
      "title": "Oxford 5000",
      "url": "https://www.oxfordlearnersdictionaries.com/external/pdf/wordlists/oxford-3000-5000/The_Oxford_5000.pdf",
      "sha256": "5cd1e8653c7b0d0ebc2f5c39edaa847cc608e16f6cdc95cb1e2d32143260e3cd"
    }
  },
  "entries": {
    "abroad|adv": {
      "level": "A2",
      "source": "oxford3000",
      "page": 1,
      "entry": "abroad adv. A2"
    },
    "accident|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 1,
      "entry": "accident n. A2"
    },
    "accommodation|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 1,
      "entry": "accommodation n. B1"
    },
    "accurate|adj": {
      "level": "B2",
      "source": "oxford3000",
      "page": 1,
      "entry": "accurate adj. B2"
    },
    "address|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 1,
      "entry": "address n. A1, v. B2"
    },
    "adventure|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 1,
      "entry": "adventure n. A2"
    },
    "advertisement|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 1,
      "entry": "advertisement n. A2"
    },
    "advertise|v": {
      "level": "A2",
      "source": "oxford3000",
      "page": 1,
      "entry": "advertise v. A2"
    },
    "afford|v": {
      "level": "B1",
      "source": "oxford3000",
      "page": 1,
      "entry": "afford v. B1"
    },
    "airline|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 1,
      "entry": "airline n. A2"
    },
    "airport|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 1,
      "entry": "airport n. A1"
    },
    "air|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 1,
      "entry": "air n. A1"
    },
    "alarm|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 1,
      "entry": "alarm n. B1, v. B2"
    },
    "ambulance|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 1,
      "entry": "ambulance n. B2"
    },
    "analyse|v": {
      "level": "B1",
      "source": "oxford3000",
      "page": 1,
      "entry": "analyse v. B1"
    },
    "analysis|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 1,
      "entry": "analysis n. B1"
    },
    "ancient|adj": {
      "level": "A2",
      "source": "oxford3000",
      "page": 1,
      "entry": "ancient adj. A2"
    },
    "animal|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 1,
      "entry": "animal n. A1"
    },
    "answer|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 1,
      "entry": "answer n., v. A1"
    },
    "apartment|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 1,
      "entry": "apartment n. A1"
    },
    "apple|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 1,
      "entry": "apple n. A1"
    },
    "area|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 1,
      "entry": "area n. A1"
    },
    "arrival|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 1,
      "entry": "arrival n. B1"
    },
    "arrive|v": {
      "level": "A1",
      "source": "oxford3000",
      "page": 1,
      "entry": "arrive v. A1"
    },
    "atmosphere|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 1,
      "entry": "atmosphere n. B1"
    },
    "autumn|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 1,
      "entry": "autumn n. A1"
    },
    "bacteria|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 1,
      "entry": "bacteria n. B2"
    },
    "bag|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 1,
      "entry": "bag n. A1"
    },
    "ball|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 1,
      "entry": "ball n. A1"
    },
    "bargain|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 1,
      "entry": "bargain n. B2"
    },
    "basement|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 1,
      "entry": "basement n. B2"
    },
    "basket|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 1,
      "entry": "basket n. B2"
    },
    "bathroom|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 1,
      "entry": "bathroom n. A1"
    },
    "bath|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 1,
      "entry": "bath n. A1"
    },
    "beach|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 1,
      "entry": "beach n. A1"
    },
    "bedroom|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 1,
      "entry": "bedroom n. A1"
    },
    "bed|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 1,
      "entry": "bed n. A1"
    },
    "bee|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 1,
      "entry": "bee n. B1"
    },
    "bill|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 2,
      "entry": "bill n. A1, v. B2"
    },
    "bin|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 2,
      "entry": "bin n. A2"
    },
    "biology|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 2,
      "entry": "biology n. A2"
    },
    "bird|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 2,
      "entry": "bird n. A1"
    },
    "blanket|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 1,
      "entry": "blanket n. B2"
    },
    "block|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 2,
      "entry": "block n., v. B1"
    },
    "blood|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 2,
      "entry": "blood n. A2"
    },
    "board|v": {
      "level": "B1",
      "source": "oxford3000",
      "page": 2,
      "entry": "board n. A2, v. B1"
    },
    "boat|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 2,
      "entry": "boat n. A1"
    },
    "bone|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 2,
      "entry": "bone n. A2"
    },
    "book|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 2,
      "entry": "book n. A1, v. A2"
    },
    "book|v": {
      "level": "A2",
      "source": "oxford3000",
      "page": 2,
      "entry": "book n. A1, v. A2"
    },
    "border|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 2,
      "entry": "border n. B1, v. B2"
    },
    "bowl|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 2,
      "entry": "bowl n. A2"
    },
    "brain|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 2,
      "entry": "brain n. A2"
    },
    "branch|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 2,
      "entry": "branch n. B1"
    },
    "brand|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 2,
      "entry": "brand n., v. B1"
    },
    "brave|adj": {
      "level": "B1",
      "source": "oxford3000",
      "page": 2,
      "entry": "brave adj. B1"
    },
    "bread|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 2,
      "entry": "bread n. A1"
    },
    "breathe|v": {
      "level": "B1",
      "source": "oxford3000",
      "page": 2,
      "entry": "breathe v. B1"
    },
    "breathing|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 2,
      "entry": "breathing n. B1"
    },
    "bridge|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 2,
      "entry": "bridge n. A2"
    },
    "broken|adj": {
      "level": "A2",
      "source": "oxford3000",
      "page": 2,
      "entry": "broken adj. A2"
    },
    "brush|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 2,
      "entry": "brush v., n. A2"
    },
    "budget|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 2,
      "entry": "budget n. B2"
    },
    "building|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 2,
      "entry": "building n. A1"
    },
    "build|v": {
      "level": "A1",
      "source": "oxford3000",
      "page": 2,
      "entry": "build v. A1"
    },
    "burn|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 2,
      "entry": "burn v. A2, n. B2"
    },
    "bush|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 2,
      "entry": "bush n. B2"
    },
    "busy|adj": {
      "level": "A1",
      "source": "oxford3000",
      "page": 2,
      "entry": "busy adj. A1"
    },
    "bus|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 2,
      "entry": "bus n. A1"
    },
    "buy|v": {
      "level": "A1",
      "source": "oxford3000",
      "page": 2,
      "entry": "buy v. A1"
    },
    "cafe|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 2,
      "entry": "cafe n. A1"
    },
    "calculate|v": {
      "level": "B2",
      "source": "oxford3000",
      "page": 2,
      "entry": "calculate v. B2"
    },
    "call|v": {
      "level": "A1",
      "source": "oxford3000",
      "page": 2,
      "entry": "call v., n. A1"
    },
    "calm|adj": {
      "level": "B1",
      "source": "oxford3000",
      "page": 2,
      "entry": "calm adj., v., n. B1"
    },
    "camera|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 2,
      "entry": "camera n. A1"
    },
    "camping|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 2,
      "entry": "camping n. A2"
    },
    "camp|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 2,
      "entry": "camp n., v. A2"
    },
    "camp|v": {
      "level": "A2",
      "source": "oxford3000",
      "page": 2,
      "entry": "camp n., v. A2"
    },
    "cancel|v": {
      "level": "B2",
      "source": "oxford3000",
      "page": 2,
      "entry": "cancel v. B2"
    },
    "capital|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 2,
      "entry": "capital n., adj. A1"
    },
    "captain|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 2,
      "entry": "captain n. B1"
    },
    "card|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 2,
      "entry": "card n. A1"
    },
    "carpet|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 2,
      "entry": "carpet n. A2"
    },
    "carry|v": {
      "level": "A1",
      "source": "oxford3000",
      "page": 2,
      "entry": "carry v. A1"
    },
    "car|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 2,
      "entry": "car n. A1"
    },
    "cash|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 2,
      "entry": "cash n. A2"
    },
    "castle|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 2,
      "entry": "castle n. A2"
    },
    "cat|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 2,
      "entry": "cat n. A1"
    },
    "cause|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 2,
      "entry": "cause n., v. A2"
    },
    "cave|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 2,
      "entry": "cave n. B2"
    },
    "ceiling|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 2,
      "entry": "ceiling n. B1"
    },
    "cell|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 2,
      "entry": "cell n. B2"
    },
    "centre|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 2,
      "entry": "centre n. A1, v. B1"
    },
    "chair|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 2,
      "entry": "chair n. A1, v. B2"
    },
    "change|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 2,
      "entry": "change v., n. A1"
    },
    "cheap|adj": {
      "level": "A1",
      "source": "oxford3000",
      "page": 2,
      "entry": "cheap adj. A1, adv. B1"
    },
    "cheese|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 2,
      "entry": "cheese n. A1"
    },
    "chemical|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 2,
      "entry": "chemical adj., n. B1"
    },
    "chemistry|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 2,
      "entry": "chemistry n. A2"
    },
    "chicken|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 2,
      "entry": "chicken n. A1"
    },
    "choice|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 2,
      "entry": "choice n. A2"
    },
    "choose|v": {
      "level": "A1",
      "source": "oxford3000",
      "page": 2,
      "entry": "choose v. A1"
    },
    "church|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 2,
      "entry": "church n. A2"
    },
    "cinema|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 2,
      "entry": "cinema n. A1"
    },
    "circle|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 2,
      "entry": "circle n., v. A2"
    },
    "citizen|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 2,
      "entry": "citizen n. B2"
    },
    "city|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 2,
      "entry": "city n. A1"
    },
    "clean|v": {
      "level": "A1",
      "source": "oxford3000",
      "page": 2,
      "entry": "clean adj., v. A1"
    },
    "climb|v": {
      "level": "A1",
      "source": "oxford3000",
      "page": 2,
      "entry": "climb v. A1, n. B1"
    },
    "clock|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 2,
      "entry": "clock n. A1"
    },
    "closed|adj": {
      "level": "A2",
      "source": "oxford3000",
      "page": 2,
      "entry": "closed adj. A2"
    },
    "clothes|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 2,
      "entry": "clothes n. A1"
    },
    "cloud|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 2,
      "entry": "cloud n. A2"
    },
    "coast|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 2,
      "entry": "coast n. A2"
    },
    "coin|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 2,
      "entry": "coin n. B1"
    },
    "cold|adj": {
      "level": "A1",
      "source": "oxford3000",
      "page": 2,
      "entry": "cold adj., n. A1"
    },
    "collapse|v": {
      "level": "B2",
      "source": "oxford3000",
      "page": 2,
      "entry": "collapse v., n. B2"
    },
    "collect|v": {
      "level": "A2",
      "source": "oxford3000",
      "page": 2,
      "entry": "collect v. A2"
    },
    "colour|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 2,
      "entry": "colour n. A1"
    },
    "comfortable|adj": {
      "level": "A2",
      "source": "oxford3000",
      "page": 2,
      "entry": "comfortable adj. A2"
    },
    "community|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 2,
      "entry": "community n. A2"
    },
    "compare|v": {
      "level": "A1",
      "source": "oxford3000",
      "page": 2,
      "entry": "compare v. A1"
    },
    "computer|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 3,
      "entry": "computer n. A1"
    },
    "control|v": {
      "level": "A2",
      "source": "oxford3000",
      "page": 3,
      "entry": "control n., v. A2"
    },
    "cooker|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 3,
      "entry": "cooker n. A2"
    },
    "cook|v": {
      "level": "A1",
      "source": "oxford3000",
      "page": 3,
      "entry": "cook v. A1, n. A2"
    },
    "cool|adj": {
      "level": "A1",
      "source": "oxford3000",
      "page": 3,
      "entry": "cool adj. A1, v. B1"
    },
    "cool|v": {
      "level": "B1",
      "source": "oxford3000",
      "page": 3,
      "entry": "cool adj. A1, v. B1"
    },
    "corner|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 3,
      "entry": "corner n. A2"
    },
    "cost|v": {
      "level": "A1",
      "source": "oxford3000",
      "page": 3,
      "entry": "cost n., v. A1"
    },
    "cottage|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 3,
      "entry": "cottage n. B1"
    },
    "countryside|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 3,
      "entry": "countryside n. B1"
    },
    "cow|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 3,
      "entry": "cow n. A1"
    },
    "crash|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 3,
      "entry": "crash n., v. B2"
    },
    "creature|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 3,
      "entry": "creature n. B2"
    },
    "credit|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 3,
      "entry": "credit n. A2, v. B2"
    },
    "crew|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 3,
      "entry": "crew n. B2"
    },
    "crop|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 3,
      "entry": "crop n. B2"
    },
    "cross|v": {
      "level": "A2",
      "source": "oxford3000",
      "page": 3,
      "entry": "cross v., n. A2"
    },
    "crowded|adj": {
      "level": "A2",
      "source": "oxford3000",
      "page": 3,
      "entry": "crowded adj. A2"
    },
    "crowd|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 3,
      "entry": "crowd n. A2"
    },
    "cruise|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 2,
      "entry": "cruise n., v. B2"
    },
    "cry|v": {
      "level": "A2",
      "source": "oxford3000",
      "page": 3,
      "entry": "cry v. A2, n. B2"
    },
    "cupboard|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 3,
      "entry": "cupboard n. A2"
    },
    "cup|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 3,
      "entry": "cup n. A1"
    },
    "cure|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 3,
      "entry": "cure v., n. B2"
    },
    "cure|v": {
      "level": "B2",
      "source": "oxford3000",
      "page": 3,
      "entry": "cure v., n. B2"
    },
    "currency|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 3,
      "entry": "currency n. B1"
    },
    "curtain|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 3,
      "entry": "curtain n. B1"
    },
    "customer|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 3,
      "entry": "customer n. A1"
    },
    "damage|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 3,
      "entry": "damage n., v. B1"
    },
    "dangerous|adj": {
      "level": "A1",
      "source": "oxford3000",
      "page": 3,
      "entry": "dangerous adj. A1"
    },
    "danger|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 3,
      "entry": "danger n. A2"
    },
    "darkness|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 2,
      "entry": "darkness n. B2"
    },
    "dark|adj": {
      "level": "A1",
      "source": "oxford3000",
      "page": 3,
      "entry": "dark adj. A1, n. A2"
    },
    "data|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 3,
      "entry": "data n. A2"
    },
    "decorate|v": {
      "level": "B1",
      "source": "oxford3000",
      "page": 3,
      "entry": "decorate v. B1"
    },
    "deep|adj": {
      "level": "A2",
      "source": "oxford3000",
      "page": 3,
      "entry": "deep adj. A2, adv. B1"
    },
    "degree|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 3,
      "entry": "degree n. A2"
    },
    "delay|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 3,
      "entry": "delay v., n. B2"
    },
    "delivery|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 3,
      "entry": "delivery n. B2"
    },
    "deliver|v": {
      "level": "B1",
      "source": "oxford3000",
      "page": 3,
      "entry": "deliver v. B1"
    },
    "department|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 3,
      "entry": "department n. A2"
    },
    "departure|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 3,
      "entry": "departure n. B1"
    },
    "desert|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 3,
      "entry": "desert n. A2, v. B2"
    },
    "desk|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 3,
      "entry": "desk n. A1"
    },
    "destination|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 3,
      "entry": "destination n. B1"
    },
    "destroy|v": {
      "level": "A2",
      "source": "oxford3000",
      "page": 3,
      "entry": "destroy v. A2"
    },
    "device|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 3,
      "entry": "device n. A2"
    },
    "diagram|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 3,
      "entry": "diagram n. B1"
    },
    "dig|v": {
      "level": "B2",
      "source": "oxford3000",
      "page": 3,
      "entry": "dig v. B2"
    },
    "direction|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 3,
      "entry": "direction n. A2"
    },
    "dirty|adj": {
      "level": "A1",
      "source": "oxford3000",
      "page": 3,
      "entry": "dirty adj. A1"
    },
    "discount|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 3,
      "entry": "discount n. B1, v. B2"
    },
    "discovery|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 3,
      "entry": "discovery n. A2"
    },
    "discover|v": {
      "level": "A2",
      "source": "oxford3000",
      "page": 3,
      "entry": "discover v. A2"
    },
    "disease|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 3,
      "entry": "disease n. A2"
    },
    "distance|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 3,
      "entry": "distance n. A2"
    },
    "distant|adj": {
      "level": "B2",
      "source": "oxford5000",
      "page": 3,
      "entry": "distant adj. B2"
    },
    "district|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 3,
      "entry": "district n. B2"
    },
    "dive|v": {
      "level": "B2",
      "source": "oxford5000",
      "page": 3,
      "entry": "dive v., n. B2"
    },
    "doctor|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 3,
      "entry": "doctor n. A1"
    },
    "dog|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 3,
      "entry": "dog n. A1"
    },
    "dollar|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 3,
      "entry": "dollar n. A1"
    },
    "door|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 3,
      "entry": "door n. A1"
    },
    "downstairs|adv": {
      "level": "A1",
      "source": "oxford3000",
      "page": 3,
      "entry": "downstairs adv. A1, adj. A2"
    },
    "dress|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 3,
      "entry": "dress n., v. A1"
    },
    "drink|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 3,
      "entry": "drink n., v. A1"
    },
    "drive|v": {
      "level": "A1",
      "source": "oxford3000",
      "page": 3,
      "entry": "drive v. A1, n. A2"
    },
    "earthquake|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 4,
      "entry": "earthquake n. B1"
    },
    "earth|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 4,
      "entry": "earth n. A2"
    },
    "effect|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 4,
      "entry": "effect n. A2"
    },
    "egg|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 4,
      "entry": "egg n. A1"
    },
    "electricity|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 4,
      "entry": "electricity n. A2"
    },
    "electric|adj": {
      "level": "A2",
      "source": "oxford3000",
      "page": 4,
      "entry": "electric adj. A2"
    },
    "element|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 4,
      "entry": "element n. B1"
    },
    "embassy|n": {
      "level": "C1",
      "source": "oxford5000",
      "page": 3,
      "entry": "embassy n. C1"
    },
    "emergency|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 4,
      "entry": "emergency n. B1"
    },
    "energy|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 4,
      "entry": "energy n. A2"
    },
    "engineer|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 4,
      "entry": "engineer n. A2"
    },
    "engine|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 4,
      "entry": "engine n. A2"
    },
    "environment|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 4,
      "entry": "environment n. A2"
    },
    "equipment|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 4,
      "entry": "equipment n. A2"
    },
    "escape|v": {
      "level": "B1",
      "source": "oxford3000",
      "page": 4,
      "entry": "escape v., n. B1"
    },
    "euro|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 4,
      "entry": "euro n. A1"
    },
    "evacuate|v": {
      "level": "C1",
      "source": "oxford5000",
      "page": 3,
      "entry": "evacuate v. C1"
    },
    "evidence|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 4,
      "entry": "evidence n. A2"
    },
    "exact|adj": {
      "level": "A2",
      "source": "oxford3000",
      "page": 4,
      "entry": "exact adj. A2"
    },
    "exchange|v": {
      "level": "B1",
      "source": "oxford3000",
      "page": 4,
      "entry": "exchange n., v. B1"
    },
    "exit|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 3,
      "entry": "exit n. B2, v. C1"
    },
    "expedition|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 4,
      "entry": "expedition n. B1"
    },
    "expensive|adj": {
      "level": "A1",
      "source": "oxford3000",
      "page": 4,
      "entry": "expensive adj. A1"
    },
    "experiment|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 4,
      "entry": "experiment n. A2, v. B1"
    },
    "experiment|v": {
      "level": "B1",
      "source": "oxford3000",
      "page": 4,
      "entry": "experiment n. A2, v. B1"
    },
    "exploration|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 4,
      "entry": "exploration n. B2"
    },
    "explore|v": {
      "level": "B1",
      "source": "oxford3000",
      "page": 4,
      "entry": "explore v. B1"
    },
    "explosion|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 4,
      "entry": "explosion n. B1"
    },
    "factory|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 4,
      "entry": "factory n. A2"
    },
    "factor|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 4,
      "entry": "factor n. A2"
    },
    "fact|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 4,
      "entry": "fact n. A1"
    },
    "family|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 4,
      "entry": "family n., adj. A1"
    },
    "fare|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 3,
      "entry": "fare n. B2"
    },
    "farmer|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 4,
      "entry": "farmer n. A1"
    },
    "farming|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 4,
      "entry": "farming n. A2"
    },
    "farm|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 4,
      "entry": "farm n. A1, v.A2"
    },
    "far|adv": {
      "level": "A1",
      "source": "oxford3000",
      "page": 4,
      "entry": "far adv. A1, adj. B1"
    },
    "feed|v": {
      "level": "A2",
      "source": "oxford3000",
      "page": 4,
      "entry": "feed v. A2, n. B2"
    },
    "fence|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 4,
      "entry": "fence n. B1"
    },
    "fever|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 3,
      "entry": "fever n. B2"
    },
    "field|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 4,
      "entry": "field n. A2"
    },
    "find|v": {
      "level": "A1",
      "source": "oxford3000",
      "page": 4,
      "entry": "find v. A1"
    },
    "firefighter|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 3,
      "entry": "firefighter n. B2"
    },
    "fire|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 4,
      "entry": "fire n. A1, v. B1"
    },
    "fishing|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 4,
      "entry": "fishing n. A2"
    },
    "fish|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 4,
      "entry": "fish n. A1, v. A2"
    },
    "fit|v": {
      "level": "A2",
      "source": "oxford3000",
      "page": 4,
      "entry": "fit v., adj. A2"
    },
    "fix|v": {
      "level": "A2",
      "source": "oxford3000",
      "page": 4,
      "entry": "fix v. A2, n. B2"
    },
    "flat|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 4,
      "entry": "flat n. A1, adj. A2"
    },
    "flight|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 4,
      "entry": "flight n. A1"
    },
    "float|v": {
      "level": "B2",
      "source": "oxford3000",
      "page": 4,
      "entry": "float v. B2"
    },
    "flood|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 4,
      "entry": "flood n., v. B1"
    },
    "floor|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 4,
      "entry": "floor n. A1"
    },
    "flower|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 4,
      "entry": "flower n. A1"
    },
    "fly|v": {
      "level": "A1",
      "source": "oxford3000",
      "page": 4,
      "entry": "fly v. A1, n. A2"
    },
    "food|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 4,
      "entry": "food n. A1"
    },
    "foreign|adj": {
      "level": "A2",
      "source": "oxford3000",
      "page": 4,
      "entry": "foreign adj. A2"
    },
    "forest|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 4,
      "entry": "forest n. A2"
    },
    "fork|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 4,
      "entry": "fork n. A2"
    },
    "formula|n": {
      "level": "C1",
      "source": "oxford5000",
      "page": 3,
      "entry": "formula n. C1"
    },
    "free|adj": {
      "level": "A1",
      "source": "oxford3000",
      "page": 5,
      "entry": "free adj. A1, adv. A2, v. B2"
    },
    "fresh|adj": {
      "level": "A2",
      "source": "oxford3000",
      "page": 5,
      "entry": "fresh adj. A2"
    },
    "fridge|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 5,
      "entry": "fridge n. A2"
    },
    "fruit|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 5,
      "entry": "fruit n. A1"
    },
    "fuel|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 5,
      "entry": "fuel n. B1, v. B2"
    },
    "furniture|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 5,
      "entry": "furniture n. A2"
    },
    "fur|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 5,
      "entry": "fur n. B1"
    },
    "gallery|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 5,
      "entry": "gallery n. A2"
    },
    "game|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 5,
      "entry": "game n. A1"
    },
    "garage|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 5,
      "entry": "garage n. B1"
    },
    "garden|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 5,
      "entry": "garden n. A1"
    },
    "gas|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 5,
      "entry": "gas n. A2"
    },
    "gate|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 5,
      "entry": "gate n. A2"
    },
    "gene|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 4,
      "entry": "gene n. B2"
    },
    "gift|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 5,
      "entry": "gift n. A2"
    },
    "glass|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 5,
      "entry": "glass n. A1"
    },
    "goods|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 5,
      "entry": "goods n. B1"
    },
    "grain|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 5,
      "entry": "grain n. B1"
    },
    "grass|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 5,
      "entry": "grass n. A2"
    },
    "gravity|n": {
      "level": "C1",
      "source": "oxford5000",
      "page": 4,
      "entry": "gravity n. C1"
    },
    "grow|v": {
      "level": "A1",
      "source": "oxford3000",
      "page": 5,
      "entry": "grow v. A1"
    },
    "guarantee|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 5,
      "entry": "guarantee v., n. B2"
    },
    "guide|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 5,
      "entry": "guide n., v. A2"
    },
    "hall|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 5,
      "entry": "hall n. A2"
    },
    "harbour|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 4,
      "entry": "harbour n. B2"
    },
    "harvest|n": {
      "level": "C1",
      "source": "oxford5000",
      "page": 4,
      "entry": "harvest n., v. C1"
    },
    "heart|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 5,
      "entry": "heart n. A2"
    },
    "heating|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 5,
      "entry": "heating n. B1"
    },
    "heat|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 5,
      "entry": "heat n., v. A2"
    },
    "heat|v": {
      "level": "A2",
      "source": "oxford3000",
      "page": 5,
      "entry": "heat n., v. A2"
    },
    "height|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 5,
      "entry": "height n. A2"
    },
    "helicopter|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 5,
      "entry": "helicopter n. B1"
    },
    "help|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 5,
      "entry": "help v., n. A1"
    },
    "hero|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 5,
      "entry": "hero n. A2"
    },
    "hide|v": {
      "level": "A2",
      "source": "oxford3000",
      "page": 5,
      "entry": "hide v. A2"
    },
    "hill|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 5,
      "entry": "hill n. A2"
    },
    "historic|adj": {
      "level": "B1",
      "source": "oxford3000",
      "page": 5,
      "entry": "historic adj. B1"
    },
    "hold|v": {
      "level": "A2",
      "source": "oxford3000",
      "page": 5,
      "entry": "hold v. A2, n. B2"
    },
    "holiday|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 5,
      "entry": "holiday n. A1"
    },
    "home|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 5,
      "entry": "home n., adv. A1, adj. A2"
    },
    "horizon|n": {
      "level": "C1",
      "source": "oxford5000",
      "page": 4,
      "entry": "horizon n. C1"
    },
    "horse|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 5,
      "entry": "horse n. A1"
    },
    "hospital|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 5,
      "entry": "hospital n. A1"
    },
    "hotel|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 5,
      "entry": "hotel n. A1"
    },
    "hot|adj": {
      "level": "A1",
      "source": "oxford3000",
      "page": 5,
      "entry": "hot adj. A1"
    },
    "house|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 5,
      "entry": "house n. A1, v. B2"
    },
    "hunt|v": {
      "level": "B1",
      "source": "oxford3000",
      "page": 5,
      "entry": "hunt v. B1, n. B2"
    },
    "hurricane|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 5,
      "entry": "hurricane n. B1"
    },
    "hurt|v": {
      "level": "A2",
      "source": "oxford3000",
      "page": 5,
      "entry": "hurt v., adj. A2, n. B2"
    },
    "hypothesis|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 4,
      "entry": "hypothesis n. B2"
    },
    "ice cream|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 5,
      "entry": "ice cream n. A1"
    },
    "idea|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 5,
      "entry": "idea n. A1"
    },
    "image|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 5,
      "entry": "image n. A2"
    },
    "immediately|adv": {
      "level": "A2",
      "source": "oxford3000",
      "page": 5,
      "entry": "immediately adv. A2"
    },
    "injection|n": {
      "level": "C1",
      "source": "oxford5000",
      "page": 4,
      "entry": "injection n. C1"
    },
    "injured|adj": {
      "level": "B1",
      "source": "oxford3000",
      "page": 5,
      "entry": "injured adj. B1"
    },
    "injury|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 5,
      "entry": "injury n. A2"
    },
    "insect|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 6,
      "entry": "insect n. A2"
    },
    "instrument|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 6,
      "entry": "instrument n. A2"
    },
    "insurance|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 6,
      "entry": "insurance n. B2"
    },
    "invention|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 6,
      "entry": "invention n. A2"
    },
    "invent|v": {
      "level": "A2",
      "source": "oxford3000",
      "page": 6,
      "entry": "invent v. A2"
    },
    "iron|v": {
      "level": "B1",
      "source": "oxford3000",
      "page": 6,
      "entry": "iron n., v. B1"
    },
    "island|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 6,
      "entry": "island n. A1"
    },
    "item|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 6,
      "entry": "item n. A2"
    },
    "jacket|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 6,
      "entry": "jacket n. A1"
    },
    "jeans|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 6,
      "entry": "jeans n. A1"
    },
    "journey|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 6,
      "entry": "journey n. A1"
    },
    "jump|v": {
      "level": "A2",
      "source": "oxford3000",
      "page": 6,
      "entry": "jump v., n. A2"
    },
    "key|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 6,
      "entry": "key n., adj. A1, v. B1"
    },
    "kitchen|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 6,
      "entry": "kitchen n. A1"
    },
    "knife|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 6,
      "entry": "knife n. A2"
    },
    "label|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 6,
      "entry": "label n., v. B1"
    },
    "laboratory|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 6,
      "entry": "laboratory n. B1"
    },
    "lab|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 6,
      "entry": "lab n. A2"
    },
    "ladder|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 4,
      "entry": "ladder n. B2"
    },
    "lake|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 6,
      "entry": "lake n. A2"
    },
    "lamp|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 6,
      "entry": "lamp n. A2"
    },
    "landlord|n": {
      "level": "C1",
      "source": "oxford5000",
      "page": 4,
      "entry": "landlord n. C1"
    },
    "landmark|n": {
      "level": "C1",
      "source": "oxford5000",
      "page": 4,
      "entry": "landmark n. C1"
    },
    "land|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 6,
      "entry": "land n. A1, v. A2"
    },
    "land|v": {
      "level": "A2",
      "source": "oxford3000",
      "page": 6,
      "entry": "land n. A1, v. A2"
    },
    "lane|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 4,
      "entry": "lane n. B2"
    },
    "language|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 6,
      "entry": "language n. A1"
    },
    "large|adj": {
      "level": "A1",
      "source": "oxford3000",
      "page": 6,
      "entry": "large adj. A1"
    },
    "launch|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 6,
      "entry": "launch v., n. B2"
    },
    "leaf|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 6,
      "entry": "leaf n. B1"
    },
    "leave|v": {
      "level": "A1",
      "source": "oxford3000",
      "page": 6,
      "entry": "leave v. A1, n. B2"
    },
    "length|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 6,
      "entry": "length n. B1"
    },
    "library|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 6,
      "entry": "library n. A1"
    },
    "lift|v": {
      "level": "A2",
      "source": "oxford3000",
      "page": 6,
      "entry": "lift v., n. A2"
    },
    "liquid|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 6,
      "entry": "liquid n., adj. B1"
    },
    "local|adj": {
      "level": "A1",
      "source": "oxford3000",
      "page": 6,
      "entry": "local adj. A1, n. B1"
    },
    "lock|v": {
      "level": "A2",
      "source": "oxford3000",
      "page": 6,
      "entry": "lock v., n. A2"
    },
    "log|n": {
      "level": "C1",
      "source": "oxford5000",
      "page": 5,
      "entry": "log n., v. C1"
    },
    "lost|adj": {
      "level": "A2",
      "source": "oxford3000",
      "page": 6,
      "entry": "lost adj. A2"
    },
    "machine|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 6,
      "entry": "machine n. A1"
    },
    "mall|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 6,
      "entry": "mall n. B1"
    },
    "map|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 6,
      "entry": "map n. A1, v. B2"
    },
    "market|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 6,
      "entry": "market n. A1, v. B1"
    },
    "material|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 6,
      "entry": "material n. A2, adj. B2"
    },
    "mathematics|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 6,
      "entry": "mathematics n. A2"
    },
    "measurement|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 6,
      "entry": "measurement n. B2"
    },
    "measure|v": {
      "level": "B1",
      "source": "oxford3000",
      "page": 6,
      "entry": "measure v., n. B1"
    },
    "medicine|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 6,
      "entry": "medicine n. A2"
    },
    "medium|adj": {
      "level": "B1",
      "source": "oxford3000",
      "page": 6,
      "entry": "medium adj. B1, n. B2"
    },
    "memory|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 6,
      "entry": "memory n. A2"
    },
    "mess|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 6,
      "entry": "mess n., v. B1"
    },
    "metal|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 6,
      "entry": "metal n. A2"
    },
    "method|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 6,
      "entry": "method n. A2"
    },
    "milk|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 6,
      "entry": "milk n. A1"
    },
    "mirror|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 7,
      "entry": "mirror n. A2"
    },
    "mission|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 7,
      "entry": "mission n. B2"
    },
    "mix|v": {
      "level": "B1",
      "source": "oxford3000",
      "page": 7,
      "entry": "mix v., n. B1"
    },
    "model|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 7,
      "entry": "model n. A1, v. B2"
    },
    "modern|adj": {
      "level": "A1",
      "source": "oxford3000",
      "page": 7,
      "entry": "modern adj. A1"
    },
    "money|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 7,
      "entry": "money n. A1"
    },
    "moon|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 7,
      "entry": "moon n. A2"
    },
    "mountain|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 7,
      "entry": "mountain n. A1"
    },
    "mud|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 7,
      "entry": "mud n. B1"
    },
    "museum|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 7,
      "entry": "museum n. A1"
    },
    "natural|adj": {
      "level": "A1",
      "source": "oxford3000",
      "page": 7,
      "entry": "natural adj. A1"
    },
    "nature|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 7,
      "entry": "nature n. A2"
    },
    "nearby|adv": {
      "level": "B2",
      "source": "oxford5000",
      "page": 5,
      "entry": "nearby adj., adv. B2"
    },
    "near|adj": {
      "level": "A1",
      "source": "oxford3000",
      "page": 7,
      "entry": "near prep., adj., adv. A1"
    },
    "neighbourhood|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 7,
      "entry": "neighbourhood n. B1"
    },
    "neighbour|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 7,
      "entry": "neighbour n. A1"
    },
    "nest|n": {
      "level": "C1",
      "source": "oxford5000",
      "page": 5,
      "entry": "nest n. C1"
    },
    "noise|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 7,
      "entry": "noise n. A2"
    },
    "noisy|adj": {
      "level": "A2",
      "source": "oxford3000",
      "page": 7,
      "entry": "noisy adj. A2"
    },
    "note|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 7,
      "entry": "note n. A1, v. B1"
    },
    "number|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 7,
      "entry": "number n. A1, v. A2"
    },
    "nurse|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 7,
      "entry": "nurse n. A1"
    },
    "observation|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 7,
      "entry": "observation n. B2"
    },
    "observe|v": {
      "level": "B2",
      "source": "oxford3000",
      "page": 7,
      "entry": "observe v. B2"
    },
    "ocean|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 7,
      "entry": "ocean n. A2"
    },
    "offer|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 7,
      "entry": "offer v., n. A2"
    },
    "officer|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 7,
      "entry": "officer n. A2"
    },
    "office|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 7,
      "entry": "office n. A1"
    },
    "online|adv": {
      "level": "A1",
      "source": "oxford3000",
      "page": 7,
      "entry": "online adj., adv. A1"
    },
    "opening|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 7,
      "entry": "opening n. B2"
    },
    "open|adj": {
      "level": "A1",
      "source": "oxford3000",
      "page": 7,
      "entry": "open adj., v. A1"
    },
    "order|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 7,
      "entry": "order n., v. A1"
    },
    "oven|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 7,
      "entry": "oven n. A2"
    },
    "oxygen|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 5,
      "entry": "oxygen n. B2"
    },
    "pack|v": {
      "level": "A2",
      "source": "oxford3000",
      "page": 7,
      "entry": "pack v. A2, n. B1"
    },
    "paint|v": {
      "level": "A1",
      "source": "oxford3000",
      "page": 7,
      "entry": "paint v., n. A1"
    },
    "pain|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 7,
      "entry": "pain n. A2"
    },
    "palace|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 7,
      "entry": "palace n. A2"
    },
    "panic|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 5,
      "entry": "panic n. B2"
    },
    "parking|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 7,
      "entry": "parking n. A2"
    },
    "park|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 7,
      "entry": "park n., v. A1"
    },
    "passenger|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 7,
      "entry": "passenger n. A2"
    },
    "passport|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 7,
      "entry": "passport n. A1"
    },
    "path|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 7,
      "entry": "path n. B1"
    },
    "patient|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 7,
      "entry": "patient n. A2, adj. B2"
    },
    "pay|v": {
      "level": "A1",
      "source": "oxford3000",
      "page": 7,
      "entry": "pay v. A1, n. A2"
    },
    "peaceful|adj": {
      "level": "B1",
      "source": "oxford3000",
      "page": 7,
      "entry": "peaceful adj. B1"
    },
    "penny|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 7,
      "entry": "penny n. A2"
    },
    "percentage|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 7,
      "entry": "percentage n. B1"
    },
    "pet|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 7,
      "entry": "pet n. A2"
    },
    "phone|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 7,
      "entry": "phone n., v. A1"
    },
    "photo|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 8,
      "entry": "photo n. A1"
    },
    "physical|adj": {
      "level": "A2",
      "source": "oxford3000",
      "page": 8,
      "entry": "physical adj. A2"
    },
    "physics|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 8,
      "entry": "physics n. A2"
    },
    "pick|v": {
      "level": "A2",
      "source": "oxford3000",
      "page": 8,
      "entry": "pick v. A2, n. B2"
    },
    "pig|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 8,
      "entry": "pig n. A1"
    },
    "pill|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 5,
      "entry": "pill n. B2"
    },
    "pilot|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 8,
      "entry": "pilot n. A2"
    },
    "planet|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 8,
      "entry": "planet n. A2"
    },
    "plane|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 8,
      "entry": "plane n. A1"
    },
    "plant|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 8,
      "entry": "plant n. A1, v. A2"
    },
    "plant|v": {
      "level": "A2",
      "source": "oxford3000",
      "page": 8,
      "entry": "plant n. A1, v. A2"
    },
    "plate|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 8,
      "entry": "plate n. A2"
    },
    "platform|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 8,
      "entry": "platform n. A2"
    },
    "police|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 8,
      "entry": "police n. A1"
    },
    "pond|n": {
      "level": "C1",
      "source": "oxford5000",
      "page": 5,
      "entry": "pond n. C1"
    },
    "population|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 8,
      "entry": "population n. A2"
    },
    "port|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 8,
      "entry": "port n. B1"
    },
    "potato|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 8,
      "entry": "potato n. A1"
    },
    "pound|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 8,
      "entry": "pound n. A1"
    },
    "power|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 8,
      "entry": "power n. A2, v. B2"
    },
    "price|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 8,
      "entry": "price n. A1, v. B2"
    },
    "process|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 8,
      "entry": "process n. A2, v. B2"
    },
    "product|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 8,
      "entry": "product n. A1"
    },
    "proof|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 8,
      "entry": "proof n. B2"
    },
    "protection|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 8,
      "entry": "protection n. B2"
    },
    "protect|v": {
      "level": "A2",
      "source": "oxford3000",
      "page": 8,
      "entry": "protect v. A2"
    },
    "prove|v": {
      "level": "B1",
      "source": "oxford3000",
      "page": 8,
      "entry": "prove v. B1"
    },
    "public|adj": {
      "level": "A2",
      "source": "oxford3000",
      "page": 8,
      "entry": "public adj., n. A2"
    },
    "pull|v": {
      "level": "A2",
      "source": "oxford3000",
      "page": 8,
      "entry": "pull v. A2, n. B1"
    },
    "push|v": {
      "level": "A2",
      "source": "oxford3000",
      "page": 8,
      "entry": "push v. A2, n. B1"
    },
    "quality|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 8,
      "entry": "quality n. A2"
    },
    "quantity|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 8,
      "entry": "quantity n. A2"
    },
    "question|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 8,
      "entry": "question n. A1, v. A2"
    },
    "queue|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 8,
      "entry": "queue n., v. B1"
    },
    "quickly|adv": {
      "level": "A1",
      "source": "oxford3000",
      "page": 8,
      "entry": "quickly adv. A1"
    },
    "quick|adj": {
      "level": "A1",
      "source": "oxford3000",
      "page": 8,
      "entry": "quick adj. A1"
    },
    "quiet|adj": {
      "level": "A1",
      "source": "oxford3000",
      "page": 8,
      "entry": "quiet adj. A1"
    },
    "radio|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 8,
      "entry": "radio n. A1"
    },
    "railway|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 8,
      "entry": "railway n. A2"
    },
    "rain|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 8,
      "entry": "rain n., v. A1"
    },
    "reaction|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 8,
      "entry": "reaction n. B1"
    },
    "receipt|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 8,
      "entry": "receipt n. B1"
    },
    "record|v": {
      "level": "A2",
      "source": "oxford3000",
      "page": 8,
      "entry": "record n., v. A2"
    },
    "recover|v": {
      "level": "B2",
      "source": "oxford3000",
      "page": 8,
      "entry": "recover v. B2"
    },
    "relax|v": {
      "level": "A1",
      "source": "oxford3000",
      "page": 8,
      "entry": "relax v. A1"
    },
    "rent|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 8,
      "entry": "rent n., v. B1"
    },
    "rent|v": {
      "level": "B1",
      "source": "oxford3000",
      "page": 8,
      "entry": "rent n., v. B1"
    },
    "repair|v": {
      "level": "A2",
      "source": "oxford3000",
      "page": 8,
      "entry": "repair v. A2, n. B1"
    },
    "rescue|v": {
      "level": "B2",
      "source": "oxford3000",
      "page": 9,
      "entry": "rescue v., n. B2"
    },
    "researcher|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 9,
      "entry": "researcher n. A2"
    },
    "research|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 9,
      "entry": "research n., v. A2"
    },
    "reservation|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 9,
      "entry": "reservation n. B1"
    },
    "resident|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 9,
      "entry": "resident n., adj. B2"
    },
    "resort|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 9,
      "entry": "resort n. B2"
    },
    "restaurant|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 9,
      "entry": "restaurant n. A1"
    },
    "result|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 9,
      "entry": "result n. A1, v. B1"
    },
    "return|v": {
      "level": "A1",
      "source": "oxford3000",
      "page": 9,
      "entry": "return v., n. A1"
    },
    "risk|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 9,
      "entry": "risk n., v. B1"
    },
    "river|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 9,
      "entry": "river n. A1"
    },
    "road|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 9,
      "entry": "road n. A1"
    },
    "robot|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 9,
      "entry": "robot n. B1"
    },
    "rocket|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 6,
      "entry": "rocket n. B2"
    },
    "roof|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 9,
      "entry": "roof n. A2"
    },
    "room|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 9,
      "entry": "room n. A1"
    },
    "root|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 9,
      "entry": "root n. B2"
    },
    "rope|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 9,
      "entry": "rope n. B1"
    },
    "rotate|v": {
      "level": "C1",
      "source": "oxford5000",
      "page": 6,
      "entry": "rotate v. C1"
    },
    "route|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 9,
      "entry": "route n. A2"
    },
    "rubbish|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 9,
      "entry": "rubbish n. A2"
    },
    "rural|adj": {
      "level": "B2",
      "source": "oxford3000",
      "page": 9,
      "entry": "rural adj. B2"
    },
    "safety|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 9,
      "entry": "safety n. B1"
    },
    "safe|adj": {
      "level": "A2",
      "source": "oxford3000",
      "page": 9,
      "entry": "safe adj. A2"
    },
    "sailing|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 9,
      "entry": "sailing n. A2"
    },
    "sail|v": {
      "level": "A2",
      "source": "oxford3000",
      "page": 9,
      "entry": "sail v. A2, n. B1"
    },
    "sale|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 9,
      "entry": "sale n. A2"
    },
    "salt|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 9,
      "entry": "salt n. A1"
    },
    "sample|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 9,
      "entry": "sample n. B1, v. B2"
    },
    "sand|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 9,
      "entry": "sand n. B1"
    },
    "satellite|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 9,
      "entry": "satellite n. B2"
    },
    "save|v": {
      "level": "A2",
      "source": "oxford3000",
      "page": 9,
      "entry": "save v. A2"
    },
    "school|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 9,
      "entry": "school n. A1"
    },
    "science|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 9,
      "entry": "science n. A1"
    },
    "scientific|adj": {
      "level": "B1",
      "source": "oxford3000",
      "page": 9,
      "entry": "scientific adj. B1"
    },
    "scientist|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 9,
      "entry": "scientist n. A1"
    },
    "scream|v": {
      "level": "B2",
      "source": "oxford3000",
      "page": 9,
      "entry": "scream v., n. B2"
    },
    "screen|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 9,
      "entry": "screen n. A2, v. B2"
    },
    "search|v": {
      "level": "A2",
      "source": "oxford3000",
      "page": 9,
      "entry": "search n., v. A2"
    },
    "season|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 9,
      "entry": "season n. A2"
    },
    "seat|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 9,
      "entry": "seat n. A2, v. B2"
    },
    "sea|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 9,
      "entry": "sea n. A1"
    },
    "seed|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 9,
      "entry": "seed n. B1"
    },
    "sell|v": {
      "level": "A1",
      "source": "oxford3000",
      "page": 9,
      "entry": "sell v. A1"
    },
    "service|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 9,
      "entry": "service n. A2"
    },
    "shade|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 9,
      "entry": "shade n. B2"
    },
    "shadow|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 9,
      "entry": "shadow n. B2"
    },
    "shallow|adj": {
      "level": "B2",
      "source": "oxford3000",
      "page": 9,
      "entry": "shallow adj. B2"
    },
    "sheep|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 9,
      "entry": "sheep n. A1"
    },
    "shelf|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 9,
      "entry": "shelf n. B1"
    },
    "shell|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 9,
      "entry": "shell n. B1"
    },
    "ship|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 9,
      "entry": "ship n. A2, v. B2"
    },
    "shirt|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 9,
      "entry": "shirt n. A1"
    },
    "shock|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 9,
      "entry": "shock n., v. B2"
    },
    "shoe|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 9,
      "entry": "shoe n. A1"
    },
    "shopping|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 9,
      "entry": "shopping n. A1"
    },
    "shop|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 9,
      "entry": "shop n., v. A1"
    },
    "shore|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 6,
      "entry": "shore n. B2"
    },
    "shout|v": {
      "level": "A2",
      "source": "oxford3000",
      "page": 9,
      "entry": "shout v., n. A2"
    },
    "shower|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 9,
      "entry": "shower n. A1"
    },
    "signal|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 9,
      "entry": "signal n., v. B1"
    },
    "sign|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 9,
      "entry": "sign n., v. A2"
    },
    "silence|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 9,
      "entry": "silence n. B2"
    },
    "simple|adj": {
      "level": "A2",
      "source": "oxford3000",
      "page": 9,
      "entry": "simple adj. A2"
    },
    "size|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 9,
      "entry": "size n. A2"
    },
    "sky|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 9,
      "entry": "sky n. A2"
    },
    "sleep|v": {
      "level": "A1",
      "source": "oxford3000",
      "page": 9,
      "entry": "sleep v. A1, n. A2"
    },
    "slow|adj": {
      "level": "A1",
      "source": "oxford3000",
      "page": 9,
      "entry": "slow adj. A1, v. B1"
    },
    "small|adj": {
      "level": "A1",
      "source": "oxford3000",
      "page": 9,
      "entry": "small adj. A1"
    },
    "smoke|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 9,
      "entry": "smoke n., v. A2"
    },
    "snake|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 9,
      "entry": "snake n. A1"
    },
    "soap|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 9,
      "entry": "soap n. A2"
    },
    "soil|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 9,
      "entry": "soil n. B1"
    },
    "solid|adj": {
      "level": "B1",
      "source": "oxford3000",
      "page": 9,
      "entry": "solid adj., n. B1"
    },
    "sound|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 10,
      "entry": "sound n., v. A1"
    },
    "space|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 10,
      "entry": "space n. A1"
    },
    "special|adj": {
      "level": "A1",
      "source": "oxford3000",
      "page": 10,
      "entry": "special adj. A1"
    },
    "species|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 10,
      "entry": "species n. B2"
    },
    "speed|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 10,
      "entry": "speed n. A2, v. B2"
    },
    "spend|v": {
      "level": "A1",
      "source": "oxford3000",
      "page": 10,
      "entry": "spend v. A1"
    },
    "spoon|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 10,
      "entry": "spoon n. A2"
    },
    "spring|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 10,
      "entry": "spring n. A1, v. B1"
    },
    "square|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 10,
      "entry": "square adj., n. A2"
    },
    "stadium|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 10,
      "entry": "stadium n. B1"
    },
    "staff|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 10,
      "entry": "staff n. B1"
    },
    "star|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 10,
      "entry": "star n. A1, v. A2"
    },
    "station|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 10,
      "entry": "station n. A1"
    },
    "statistic|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 10,
      "entry": "statistic n. B1"
    },
    "stone|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 10,
      "entry": "stone n. A2"
    },
    "store|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 10,
      "entry": "store n. A2, v. B1"
    },
    "storm|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 10,
      "entry": "storm n. A2"
    },
    "stream|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 10,
      "entry": "stream n. B2"
    },
    "street|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 10,
      "entry": "street n. A1"
    },
    "study|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 10,
      "entry": "study n., v. A1"
    },
    "substance|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 10,
      "entry": "substance n. B1"
    },
    "suburb|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 7,
      "entry": "suburb n.B2"
    },
    "suit|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 10,
      "entry": "suit n. A2, v. B1"
    },
    "summer|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 10,
      "entry": "summer n. A1"
    },
    "sun|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 10,
      "entry": "sun n. A1"
    },
    "supermarket|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 10,
      "entry": "supermarket n. A1"
    },
    "survive|v": {
      "level": "B1",
      "source": "oxford3000",
      "page": 10,
      "entry": "survive v. B1"
    },
    "survivor|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 7,
      "entry": "survivor n. B2"
    },
    "sweater|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 10,
      "entry": "sweater n. A1"
    },
    "swimming|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 10,
      "entry": "swimming n. A1"
    },
    "swim|v": {
      "level": "A1",
      "source": "oxford3000",
      "page": 10,
      "entry": "swim v. A1, n. B1"
    },
    "table|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 10,
      "entry": "table n. A1"
    },
    "tail|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 10,
      "entry": "tail n. B1"
    },
    "tap|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 7,
      "entry": "tap v., n. B2"
    },
    "taxi|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 10,
      "entry": "taxi n. A1"
    },
    "team|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 10,
      "entry": "team n. A1"
    },
    "technique|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 10,
      "entry": "technique n. B1"
    },
    "technology|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 10,
      "entry": "technology n. A2"
    },
    "television|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 10,
      "entry": "television n. A1"
    },
    "temperature|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 10,
      "entry": "temperature n. A2"
    },
    "tent|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 10,
      "entry": "tent n. B1"
    },
    "test|v": {
      "level": "A1",
      "source": "oxford3000",
      "page": 10,
      "entry": "test n., v. A1"
    },
    "theatre|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 10,
      "entry": "theatre n. A1"
    },
    "theory|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 10,
      "entry": "theory n. B1"
    },
    "ticket|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 10,
      "entry": "ticket n. A1"
    },
    "tide|n": {
      "level": "C1",
      "source": "oxford5000",
      "page": 7,
      "entry": "tide n. C1"
    },
    "tidy|v": {
      "level": "A2",
      "source": "oxford3000",
      "page": 10,
      "entry": "tidy adj., v. A2"
    },
    "toilet|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 10,
      "entry": "toilet n. A1"
    },
    "tool|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 10,
      "entry": "tool n. A2"
    },
    "total|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 10,
      "entry": "total adj., n. B1"
    },
    "tourist|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 10,
      "entry": "tourist n. A1"
    },
    "tour|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 10,
      "entry": "tour n. A2, v. B1"
    },
    "towel|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 10,
      "entry": "towel n. A2"
    },
    "tower|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 10,
      "entry": "tower n. A2"
    },
    "town|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 10,
      "entry": "town n. A1"
    },
    "toy|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 10,
      "entry": "toy n., adj. A2"
    },
    "traditional|adj": {
      "level": "A2",
      "source": "oxford3000",
      "page": 10,
      "entry": "traditional adj. A2"
    },
    "tradition|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 10,
      "entry": "tradition n. A2"
    },
    "traffic|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 10,
      "entry": "traffic n. A1"
    },
    "trail|n": {
      "level": "C1",
      "source": "oxford5000",
      "page": 7,
      "entry": "trail n., v. C1"
    },
    "training|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 10,
      "entry": "training n. A2"
    },
    "train|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 10,
      "entry": "train n. A1, v. A2"
    },
    "translate|v": {
      "level": "B1",
      "source": "oxford3000",
      "page": 10,
      "entry": "translate v. B1"
    },
    "transport|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 10,
      "entry": "transport n. A2, v. B1"
    },
    "trap|v": {
      "level": "B2",
      "source": "oxford5000",
      "page": 7,
      "entry": "trap v., n. B2"
    },
    "traveller|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 10,
      "entry": "traveller n. A2"
    },
    "travel|v": {
      "level": "A1",
      "source": "oxford3000",
      "page": 10,
      "entry": "travel v., n. A1"
    },
    "treatment|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 10,
      "entry": "treatment n. B1"
    },
    "treat|v": {
      "level": "B1",
      "source": "oxford3000",
      "page": 10,
      "entry": "treat v. B1"
    },
    "tree|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 10,
      "entry": "tree n. A1"
    },
    "trip|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 11,
      "entry": "trip n. A1, v. B2"
    },
    "umbrella|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 11,
      "entry": "umbrella n. A1"
    },
    "unconscious|adj": {
      "level": "B2",
      "source": "oxford3000",
      "page": 11,
      "entry": "unconscious adj. B2"
    },
    "universe|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 11,
      "entry": "universe n. B2"
    },
    "university|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 11,
      "entry": "university n. A1"
    },
    "upstairs|adv": {
      "level": "A1",
      "source": "oxford3000",
      "page": 11,
      "entry": "upstairs adv. A1, adj. A2"
    },
    "urban|adj": {
      "level": "B2",
      "source": "oxford3000",
      "page": 11,
      "entry": "urban adj. B2"
    },
    "urgent|adj": {
      "level": "B2",
      "source": "oxford5000",
      "page": 7,
      "entry": "urgent adj. B2"
    },
    "vacation|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 11,
      "entry": "vacation n. A1"
    },
    "vacuum|n": {
      "level": "C1",
      "source": "oxford5000",
      "page": 7,
      "entry": "vacuum n. C1"
    },
    "valley|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 11,
      "entry": "valley n. A2"
    },
    "vegetable|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 11,
      "entry": "vegetable n. A1"
    },
    "vehicle|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 11,
      "entry": "vehicle n. A2"
    },
    "victim|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 11,
      "entry": "victim n. B1"
    },
    "view|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 11,
      "entry": "view n. A2, v. B1"
    },
    "village|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 11,
      "entry": "village n. A1"
    },
    "virus|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 11,
      "entry": "virus n. A2"
    },
    "visa|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 8,
      "entry": "visa n. B2"
    },
    "visit|v": {
      "level": "A1",
      "source": "oxford3000",
      "page": 11,
      "entry": "visit v., n. A1"
    },
    "wake|v": {
      "level": "A1",
      "source": "oxford3000",
      "page": 11,
      "entry": "wake v. A1"
    },
    "walk|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 11,
      "entry": "walk v., n. A1"
    },
    "walk|v": {
      "level": "A1",
      "source": "oxford3000",
      "page": 11,
      "entry": "walk v., n. A1"
    },
    "wall|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 11,
      "entry": "wall n. A1"
    },
    "warm|adj": {
      "level": "A1",
      "source": "oxford3000",
      "page": 11,
      "entry": "warm adj. A1, v. B1"
    },
    "warning|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 11,
      "entry": "warning n. B1"
    },
    "warn|v": {
      "level": "B1",
      "source": "oxford3000",
      "page": 11,
      "entry": "warn v. B1"
    },
    "wash|v": {
      "level": "A1",
      "source": "oxford3000",
      "page": 11,
      "entry": "wash v. A1, n. A2"
    },
    "waste|v": {
      "level": "B1",
      "source": "oxford3000",
      "page": 11,
      "entry": "waste n., v., adj. B1"
    },
    "water|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 11,
      "entry": "water n. A1, v. B1"
    },
    "water|v": {
      "level": "B1",
      "source": "oxford3000",
      "page": 11,
      "entry": "water n. A1, v. B1"
    },
    "wave|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 11,
      "entry": "wave n. A2, v. B1"
    },
    "weather|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 11,
      "entry": "weather n. A1"
    },
    "website|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 11,
      "entry": "website n. A1"
    },
    "weight|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 11,
      "entry": "weight n. A2"
    },
    "well|n": {
      "level": "C1",
      "source": "oxford5000",
      "page": 8,
      "entry": "well n. C1"
    },
    "wet|adj": {
      "level": "A2",
      "source": "oxford3000",
      "page": 11,
      "entry": "wet adj. A2"
    },
    "wheat|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 8,
      "entry": "wheat n. B2"
    },
    "wildlife|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 11,
      "entry": "wildlife n. B2"
    },
    "wild|adj": {
      "level": "A2",
      "source": "oxford3000",
      "page": 11,
      "entry": "wild adj. A2"
    },
    "window|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 11,
      "entry": "window n. A1"
    },
    "wind|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 11,
      "entry": "wind1 n. A2"
    },
    "wing|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 11,
      "entry": "wing n. B1"
    },
    "winter|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 11,
      "entry": "winter n. A1"
    },
    "wooden|adj": {
      "level": "A2",
      "source": "oxford3000",
      "page": 11,
      "entry": "wooden adj. A2"
    },
    "wood|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 11,
      "entry": "wood n. A2"
    },
    "wool|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 11,
      "entry": "wool n. B1"
    },
    "world|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 11,
      "entry": "world n. A1"
    },
    "wound|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 11,
      "entry": "wound n., v. B2"
    },
    "yard|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 11,
      "entry": "yard n. B1"
    }
  }
};
  const lookup = (word, pos) => data.entries[String(word).normalize("NFKC").toLowerCase().trim()+"|"+pos] || null;
  return {...data, lookup};
})();
if(typeof module!=="undefined")module.exports=WordLevels;
