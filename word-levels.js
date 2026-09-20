// Verified word/POS levels, not card positions. Sources and update procedure: docs/WORD_LEVELS.md.
const WordLevels = (() => {
  const data = {
  "checkedAt": "2026-09-20",
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
    "academic|adj": {
      "level": "B1",
      "source": "oxford3000",
      "page": 1,
      "entry": "academic adj.B1, n. B2"
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
    "accuse|v": {
      "level": "B2",
      "source": "oxford3000",
      "page": 1,
      "entry": "accuse v. B2"
    },
    "address|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 1,
      "entry": "address n. A1, v. B2"
    },
    "affordable|adj": {
      "level": "B2",
      "source": "oxford5000",
      "page": 1,
      "entry": "affordable adj. B2"
    },
    "agreement|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 1,
      "entry": "agreement n. B1"
    },
    "agriculture|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 1,
      "entry": "agriculture n. B2"
    },
    "airport|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 1,
      "entry": "airport n. A1"
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
    "announce|v": {
      "level": "B1",
      "source": "oxford3000",
      "page": 1,
      "entry": "announce v. B1"
    },
    "answer|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 1,
      "entry": "answer n., v. A1"
    },
    "anxiety|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 1,
      "entry": "anxiety n. B2"
    },
    "appetite|n": {
      "level": "C1",
      "source": "oxford5000",
      "page": 1,
      "entry": "appetite n. C1"
    },
    "approach|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 1,
      "entry": "approach n., v. B2"
    },
    "arrival|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 1,
      "entry": "arrival n. B1"
    },
    "assessment|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 1,
      "entry": "assessment n. B2"
    },
    "atmosphere|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 1,
      "entry": "atmosphere n. B1"
    },
    "attachment|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 1,
      "entry": "attachment n. B2"
    },
    "auction|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 1,
      "entry": "auction n. B2"
    },
    "backup|n": {
      "level": "C1",
      "source": "oxford5000",
      "page": 1,
      "entry": "backup n. C1"
    },
    "bake|v": {
      "level": "B1",
      "source": "oxford3000",
      "page": 1,
      "entry": "bake v. B1"
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
    "bitter|adj": {
      "level": "B2",
      "source": "oxford3000",
      "page": 2,
      "entry": "bitter adj. B2"
    },
    "blame|v": {
      "level": "B2",
      "source": "oxford3000",
      "page": 2,
      "entry": "blame v., n. B2"
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
    "boil|v": {
      "level": "A2",
      "source": "oxford3000",
      "page": 2,
      "entry": "boil v. A2"
    },
    "bone|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 2,
      "entry": "bone n. A2"
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
    "breakdown|n": {
      "level": "C1",
      "source": "oxford5000",
      "page": 1,
      "entry": "breakdown n. C1"
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
    "browser|n": {
      "level": "C1",
      "source": "oxford5000",
      "page": 1,
      "entry": "browser n. C1"
    },
    "budget|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 2,
      "entry": "budget n. B2"
    },
    "bug|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 1,
      "entry": "bug n. B2"
    },
    "building|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 2,
      "entry": "building n. A1"
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
    "buy|v": {
      "level": "A1",
      "source": "oxford3000",
      "page": 2,
      "entry": "buy v. A1"
    },
    "calculate|v": {
      "level": "B2",
      "source": "oxford3000",
      "page": 2,
      "entry": "calculate v. B2"
    },
    "campaign|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 2,
      "entry": "campaign n., v. B1"
    },
    "camp|v": {
      "level": "A2",
      "source": "oxford3000",
      "page": 2,
      "entry": "camp n., v. A2"
    },
    "carbon|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 1,
      "entry": "carbon n. B2"
    },
    "card|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 2,
      "entry": "card n. A1"
    },
    "cash|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 2,
      "entry": "cash n. A2"
    },
    "casual|adj": {
      "level": "B2",
      "source": "oxford5000",
      "page": 2,
      "entry": "casual adj. B2"
    },
    "catalogue|n": {
      "level": "C1",
      "source": "oxford5000",
      "page": 2,
      "entry": "catalogue n. C1"
    },
    "category|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 2,
      "entry": "category n. B1"
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
    "chemical|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 2,
      "entry": "chemical adj., n. B1"
    },
    "chicken|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 2,
      "entry": "chicken n. A1"
    },
    "chop|v": {
      "level": "B2",
      "source": "oxford5000",
      "page": 2,
      "entry": "chop v. B2"
    },
    "chronic|adj": {
      "level": "C1",
      "source": "oxford5000",
      "page": 2,
      "entry": "chronic adj. C1"
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
    "climate|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 2,
      "entry": "climate n. A2"
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
    "compare|v": {
      "level": "A1",
      "source": "oxford3000",
      "page": 2,
      "entry": "compare v. A1"
    },
    "competitor|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 2,
      "entry": "competitor n. B1"
    },
    "complaint|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 2,
      "entry": "complaint n. B1"
    },
    "concept|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 3,
      "entry": "concept n. B2"
    },
    "conclusion|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 3,
      "entry": "conclusion n. B1"
    },
    "confess|v": {
      "level": "B2",
      "source": "oxford5000",
      "page": 2,
      "entry": "confess v. B2"
    },
    "conservation|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 2,
      "entry": "conservation n. B2"
    },
    "consumer|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 3,
      "entry": "consumer n. B1"
    },
    "consume|v": {
      "level": "B1",
      "source": "oxford3000",
      "page": 3,
      "entry": "consume v. B1"
    },
    "consumption|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 2,
      "entry": "consumption n. B2"
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
    "course|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 3,
      "entry": "course n. A1"
    },
    "court|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 3,
      "entry": "court n. B1"
    },
    "cow|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 3,
      "entry": "cow n. A1"
    },
    "crash|v": {
      "level": "B2",
      "source": "oxford3000",
      "page": 3,
      "entry": "crash n., v. B2"
    },
    "crew|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 3,
      "entry": "crew n. B2"
    },
    "crime|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 3,
      "entry": "crime n. A2"
    },
    "criminal|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 3,
      "entry": "criminal n. A2, adj. B1"
    },
    "criticism|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 3,
      "entry": "criticism n. B2"
    },
    "criticize|v": {
      "level": "B2",
      "source": "oxford3000",
      "page": 3,
      "entry": "criticize v. B2"
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
    "cruise|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 2,
      "entry": "cruise n., v. B2"
    },
    "cupboard|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 3,
      "entry": "cupboard n. A2"
    },
    "cure|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 3,
      "entry": "cure v., n. B2"
    },
    "curriculum|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 2,
      "entry": "curriculum n. B2"
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
    "dairy|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 2,
      "entry": "dairy n., adj. B2"
    },
    "danger|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 3,
      "entry": "danger n. A2"
    },
    "database|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 2,
      "entry": "database n. B2"
    },
    "data|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 3,
      "entry": "data n. A2"
    },
    "deal|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 3,
      "entry": "deal v. A2, n. B1"
    },
    "debate|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 3,
      "entry": "debate n., v. B2"
    },
    "debt|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 3,
      "entry": "debt n. B2"
    },
    "declare|v": {
      "level": "B2",
      "source": "oxford3000",
      "page": 3,
      "entry": "declare v. B2"
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
    "define|v": {
      "level": "B1",
      "source": "oxford3000",
      "page": 3,
      "entry": "define v. B1"
    },
    "definition|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 3,
      "entry": "definition n. B1"
    },
    "degree|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 3,
      "entry": "degree n. A2"
    },
    "delivery|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 3,
      "entry": "delivery n. B2"
    },
    "demand|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 3,
      "entry": "demand n., v. B2"
    },
    "democracy|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 2,
      "entry": "democracy n. B2"
    },
    "departure|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 3,
      "entry": "departure n. B1"
    },
    "depression|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 2,
      "entry": "depression n. B2"
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
    "destruction|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 2,
      "entry": "destruction n. B2"
    },
    "diagnosis|n": {
      "level": "C1",
      "source": "oxford5000",
      "page": 3,
      "entry": "diagnosis n. C1"
    },
    "diet|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 3,
      "entry": "diet n. A1"
    },
    "dig|v": {
      "level": "B2",
      "source": "oxford3000",
      "page": 3,
      "entry": "dig v. B2"
    },
    "disaster|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 3,
      "entry": "disaster n. A2"
    },
    "discipline|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 3,
      "entry": "discipline n. B2"
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
    "dish|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 3,
      "entry": "dish n. A1"
    },
    "distant|adj": {
      "level": "B2",
      "source": "oxford5000",
      "page": 3,
      "entry": "distant adj. B2"
    },
    "dive|v": {
      "level": "B2",
      "source": "oxford5000",
      "page": 3,
      "entry": "dive v., n. B2"
    },
    "door|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 3,
      "entry": "door n. A1"
    },
    "dose|n": {
      "level": "C1",
      "source": "oxford5000",
      "page": 3,
      "entry": "dose n. C1"
    },
    "drought|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 3,
      "entry": "drought n. B2"
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
    "economy|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 4,
      "entry": "economy n. B1"
    },
    "election|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 4,
      "entry": "election n. B1"
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
    "emission|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 3,
      "entry": "emission n. B2"
    },
    "energy|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 4,
      "entry": "energy n. A2"
    },
    "environment|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 4,
      "entry": "environment n. A2"
    },
    "essay|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 4,
      "entry": "essay n. A2"
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
    "exaggerate|v": {
      "level": "C1",
      "source": "oxford5000",
      "page": 3,
      "entry": "exaggerate v. C1"
    },
    "exchange|v": {
      "level": "B1",
      "source": "oxford3000",
      "page": 4,
      "entry": "exchange n., v. B1"
    },
    "excuse|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 4,
      "entry": "excuse n., v. B2"
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
    "expense|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 4,
      "entry": "expense n. B2"
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
    "explore|v": {
      "level": "B1",
      "source": "oxford3000",
      "page": 4,
      "entry": "explore v. B1"
    },
    "express|v": {
      "level": "A2",
      "source": "oxford3000",
      "page": 4,
      "entry": "express v. A2"
    },
    "fact|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 4,
      "entry": "fact n. A1"
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
    "farm|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 4,
      "entry": "farm n. A1, v.A2"
    },
    "fashionable|adj": {
      "level": "B1",
      "source": "oxford3000",
      "page": 4,
      "entry": "fashionable adj. B1"
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
    "field|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 4,
      "entry": "field n. A2"
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
    "fitness|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 4,
      "entry": "fitness n. B1"
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
    "flavour|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 3,
      "entry": "flavour n. B2"
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
    "forest|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 4,
      "entry": "forest n. A2"
    },
    "formal|adj": {
      "level": "A2",
      "source": "oxford3000",
      "page": 5,
      "entry": "formal adj. A2"
    },
    "formula|n": {
      "level": "C1",
      "source": "oxford5000",
      "page": 3,
      "entry": "formula n. C1"
    },
    "freeze|v": {
      "level": "B1",
      "source": "oxford3000",
      "page": 5,
      "entry": "freeze v. B1"
    },
    "fridge|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 5,
      "entry": "fridge n. A2"
    },
    "fry|v": {
      "level": "B1",
      "source": "oxford3000",
      "page": 5,
      "entry": "fry v. B1"
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
    "gate|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 5,
      "entry": "gate n. A2"
    },
    "government|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 5,
      "entry": "government n. A2"
    },
    "graduate|v": {
      "level": "B1",
      "source": "oxford3000",
      "page": 5,
      "entry": "graduate n., v. B1"
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
    "greenhouse|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 4,
      "entry": "greenhouse n. B2"
    },
    "grow|v": {
      "level": "A1",
      "source": "oxford3000",
      "page": 5,
      "entry": "grow v. A1"
    },
    "guarantee|v": {
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
    "guilty|adj": {
      "level": "B1",
      "source": "oxford3000",
      "page": 5,
      "entry": "guilty adj. B1"
    },
    "habitat|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 4,
      "entry": "habitat n. B2"
    },
    "harbour|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 4,
      "entry": "harbour n. B2"
    },
    "hardware|n": {
      "level": "C1",
      "source": "oxford5000",
      "page": 4,
      "entry": "hardware n. C1"
    },
    "harvest|n": {
      "level": "C1",
      "source": "oxford5000",
      "page": 4,
      "entry": "harvest n., v. C1"
    },
    "heat|v": {
      "level": "A2",
      "source": "oxford3000",
      "page": 5,
      "entry": "heat n., v. A2"
    },
    "help|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 5,
      "entry": "help v., n. A1"
    },
    "herb|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 4,
      "entry": "herb n. B2"
    },
    "hint|n": {
      "level": "C1",
      "source": "oxford5000",
      "page": 4,
      "entry": "hint n., v. C1"
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
    "household|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 5,
      "entry": "household n. B2"
    },
    "hurricane|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 5,
      "entry": "hurricane n. B1"
    },
    "hypothesis|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 4,
      "entry": "hypothesis n. B2"
    },
    "idea|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 5,
      "entry": "idea n. A1"
    },
    "illegal|adj": {
      "level": "B1",
      "source": "oxford3000",
      "page": 5,
      "entry": "illegal adj. B1"
    },
    "immigration|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 4,
      "entry": "immigration n. B2"
    },
    "immune|adj": {
      "level": "B2",
      "source": "oxford5000",
      "page": 4,
      "entry": "immune adj. B2"
    },
    "infection|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 5,
      "entry": "infection n. B2"
    },
    "ingredient|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 5,
      "entry": "ingredient n. B1"
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
    "innocent|adj": {
      "level": "B1",
      "source": "oxford3000",
      "page": 6,
      "entry": "innocent adj. B1"
    },
    "innovation|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 4,
      "entry": "innovation n. B2"
    },
    "insect|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 6,
      "entry": "insect n. A2"
    },
    "install|v": {
      "level": "B2",
      "source": "oxford3000",
      "page": 6,
      "entry": "install v. B2"
    },
    "insurance|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 6,
      "entry": "insurance n. B2"
    },
    "interest|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 6,
      "entry": "interest n., v. A1"
    },
    "interrupt|v": {
      "level": "B2",
      "source": "oxford3000",
      "page": 6,
      "entry": "interrupt v. B2"
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
    "investment|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 6,
      "entry": "investment n. B2"
    },
    "invest|v": {
      "level": "B1",
      "source": "oxford3000",
      "page": 6,
      "entry": "invest v. B1"
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
    "joint|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 4,
      "entry": "joint adj., n. B2"
    },
    "junction|n": {
      "level": "C1",
      "source": "oxford5000",
      "page": 4,
      "entry": "junction n. C1"
    },
    "justice|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 6,
      "entry": "justice n. B2"
    },
    "key|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 6,
      "entry": "key n., adj. A1, v. B1"
    },
    "kidney|n": {
      "level": "C1",
      "source": "oxford5000",
      "page": 4,
      "entry": "kidney n. C1"
    },
    "kitchen|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 6,
      "entry": "kitchen n. A1"
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
    "launch|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 6,
      "entry": "launch v., n. B2"
    },
    "launch|v": {
      "level": "B2",
      "source": "oxford3000",
      "page": 6,
      "entry": "launch v., n. B2"
    },
    "lawn|n": {
      "level": "C1",
      "source": "oxford5000",
      "page": 4,
      "entry": "lawn n. C1"
    },
    "leaf|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 6,
      "entry": "leaf n. B1"
    },
    "leak|n": {
      "level": "C1",
      "source": "oxford5000",
      "page": 4,
      "entry": "leak v., n. C1"
    },
    "lecture|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 6,
      "entry": "lecture n., v. A2"
    },
    "legal|adj": {
      "level": "B1",
      "source": "oxford3000",
      "page": 6,
      "entry": "legal adj. B1"
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
    "licence|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 6,
      "entry": "licence n. B2"
    },
    "link|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 6,
      "entry": "link n., v. A2"
    },
    "literature|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 6,
      "entry": "literature n. B1"
    },
    "liver|n": {
      "level": "C1",
      "source": "oxford5000",
      "page": 4,
      "entry": "liver n. C1"
    },
    "loan|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 6,
      "entry": "loan n. B2"
    },
    "log|n": {
      "level": "C1",
      "source": "oxford5000",
      "page": 5,
      "entry": "log n., v. C1"
    },
    "loss|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 6,
      "entry": "loss n. B1"
    },
    "lung|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 6,
      "entry": "lung n. B2"
    },
    "luxury|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 6,
      "entry": "luxury n. B1"
    },
    "maintenance|n": {
      "level": "C1",
      "source": "oxford5000",
      "page": 5,
      "entry": "maintenance n. C1"
    },
    "map|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 6,
      "entry": "map n. A1, v. B2"
    },
    "measure|v": {
      "level": "B1",
      "source": "oxford3000",
      "page": 6,
      "entry": "measure v., n. B1"
    },
    "mental|adj": {
      "level": "B1",
      "source": "oxford3000",
      "page": 6,
      "entry": "mental adj. B1"
    },
    "mention|v": {
      "level": "A2",
      "source": "oxford3000",
      "page": 6,
      "entry": "mention v. A2, n. B1"
    },
    "mess|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 6,
      "entry": "mess n., v. B1"
    },
    "method|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 6,
      "entry": "method n. A2"
    },
    "mild|adj": {
      "level": "B1",
      "source": "oxford3000",
      "page": 6,
      "entry": "mild adj. B1"
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
    "mortgage|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 5,
      "entry": "mortgage n. B2"
    },
    "muscle|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 7,
      "entry": "muscle n. B1"
    },
    "museum|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 7,
      "entry": "museum n. A1"
    },
    "nearby|adv": {
      "level": "B2",
      "source": "oxford5000",
      "page": 5,
      "entry": "nearby adj., adv. B2"
    },
    "neighbourhood|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 7,
      "entry": "neighbourhood n. B1"
    },
    "nerve|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 7,
      "entry": "nerve n. B2"
    },
    "nest|n": {
      "level": "C1",
      "source": "oxford5000",
      "page": 5,
      "entry": "nest n. C1"
    },
    "number|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 7,
      "entry": "number n. A1, v. A2"
    },
    "nutrition|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 5,
      "entry": "nutrition n. B2"
    },
    "obesity|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 5,
      "entry": "obesity n. B2"
    },
    "ocean|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 7,
      "entry": "ocean n. A2"
    },
    "organic|adj": {
      "level": "B2",
      "source": "oxford5000",
      "page": 5,
      "entry": "organic adj. B2"
    },
    "outcome|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 7,
      "entry": "outcome n. B2"
    },
    "outlet|n": {
      "level": "C1",
      "source": "oxford5000",
      "page": 5,
      "entry": "outlet n. C1"
    },
    "oven|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 7,
      "entry": "oven n. A2"
    },
    "pack|v": {
      "level": "A2",
      "source": "oxford3000",
      "page": 7,
      "entry": "pack v. A2, n. B1"
    },
    "park|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 7,
      "entry": "park n., v. A1"
    },
    "parliament|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 7,
      "entry": "parliament n. B2"
    },
    "passport|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 7,
      "entry": "passport n. A1"
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
    "persuade|v": {
      "level": "B1",
      "source": "oxford3000",
      "page": 7,
      "entry": "persuade v. B1"
    },
    "petrol|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 7,
      "entry": "petrol n. A2"
    },
    "phenomenon|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 7,
      "entry": "phenomenon n. B2"
    },
    "physical|adj": {
      "level": "A2",
      "source": "oxford3000",
      "page": 8,
      "entry": "physical adj. A2"
    },
    "planet|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 8,
      "entry": "planet n. A2"
    },
    "platform|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 8,
      "entry": "platform n. A2"
    },
    "policy|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 8,
      "entry": "policy n. B1"
    },
    "politician|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 8,
      "entry": "politician n. B1"
    },
    "pollution|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 8,
      "entry": "pollution n. A2"
    },
    "pond|n": {
      "level": "C1",
      "source": "oxford5000",
      "page": 5,
      "entry": "pond n. C1"
    },
    "portion|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 5,
      "entry": "portion n. B2"
    },
    "pour|v": {
      "level": "B1",
      "source": "oxford3000",
      "page": 8,
      "entry": "pour v. B1"
    },
    "praise|v": {
      "level": "B2",
      "source": "oxford3000",
      "page": 8,
      "entry": "praise n., v. B2"
    },
    "precise|adj": {
      "level": "B2",
      "source": "oxford5000",
      "page": 5,
      "entry": "precise adj. B2"
    },
    "prescription|n": {
      "level": "C1",
      "source": "oxford5000",
      "page": 6,
      "entry": "prescription n. C1"
    },
    "preserve|v": {
      "level": "B2",
      "source": "oxford3000",
      "page": 8,
      "entry": "preserve v. B2"
    },
    "price|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 8,
      "entry": "price n. A1, v. B2"
    },
    "principle|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 8,
      "entry": "principle n. B2"
    },
    "prison|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 8,
      "entry": "prison n. A2"
    },
    "profit|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 8,
      "entry": "profit n. B1"
    },
    "property|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 8,
      "entry": "property n. B1"
    },
    "protest|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 8,
      "entry": "protest n., v. B1"
    },
    "prove|v": {
      "level": "B1",
      "source": "oxford3000",
      "page": 8,
      "entry": "prove v. B1"
    },
    "punishment|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 8,
      "entry": "punishment n. B1"
    },
    "purchase|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 8,
      "entry": "purchase n., v. B2"
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
    "raw|adj": {
      "level": "B2",
      "source": "oxford3000",
      "page": 8,
      "entry": "raw adj. B2"
    },
    "reaction|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 8,
      "entry": "reaction n. B1"
    },
    "reasonable|adj": {
      "level": "B2",
      "source": "oxford3000",
      "page": 8,
      "entry": "reasonable adj. B2"
    },
    "receipt|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 8,
      "entry": "receipt n. B1"
    },
    "recipe|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 8,
      "entry": "recipe n. A2"
    },
    "record|v": {
      "level": "A2",
      "source": "oxford3000",
      "page": 8,
      "entry": "record n., v. A2"
    },
    "recovery|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 6,
      "entry": "recovery n. B2"
    },
    "recover|v": {
      "level": "B2",
      "source": "oxford3000",
      "page": 8,
      "entry": "recover v. B2"
    },
    "recycle|v": {
      "level": "A2",
      "source": "oxford3000",
      "page": 8,
      "entry": "recycle v. A2"
    },
    "refugee|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 6,
      "entry": "refugee n. B2"
    },
    "relax|v": {
      "level": "A1",
      "source": "oxford3000",
      "page": 8,
      "entry": "relax v. A1"
    },
    "remark|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 8,
      "entry": "remark n., v. B2"
    },
    "remote|adj": {
      "level": "B1",
      "source": "oxford3000",
      "page": 8,
      "entry": "remote adj. B1"
    },
    "rent|n": {
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
    "resort|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 9,
      "entry": "resort n. B2"
    },
    "resource|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 9,
      "entry": "resource n. B1"
    },
    "result|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 9,
      "entry": "result n. A1, v. B1"
    },
    "retail|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 6,
      "entry": "retail n. B2"
    },
    "revenue|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 6,
      "entry": "revenue n. B2"
    },
    "revise|v": {
      "level": "B1",
      "source": "oxford3000",
      "page": 9,
      "entry": "revise v. B1"
    },
    "rocket|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 6,
      "entry": "rocket n. B2"
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
    "rumour|n": {
      "level": "C1",
      "source": "oxford5000",
      "page": 6,
      "entry": "rumour n. C1"
    },
    "rural|adj": {
      "level": "B2",
      "source": "oxford3000",
      "page": 9,
      "entry": "rural adj. B2"
    },
    "safe|adj": {
      "level": "A2",
      "source": "oxford3000",
      "page": 9,
      "entry": "safe adj. A2"
    },
    "sale|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 9,
      "entry": "sale n. A2"
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
    "sauce|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 9,
      "entry": "sauce n. A2"
    },
    "scholarship|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 6,
      "entry": "scholarship n. B2"
    },
    "science|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 9,
      "entry": "science n. A1"
    },
    "scientist|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 9,
      "entry": "scientist n. A1"
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
    "seminar|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 6,
      "entry": "seminar n. B2"
    },
    "severe|adj": {
      "level": "B2",
      "source": "oxford3000",
      "page": 9,
      "entry": "severe adj. B2"
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
    "shareholder|n": {
      "level": "C1",
      "source": "oxford5000",
      "page": 6,
      "entry": "shareholder n. C1"
    },
    "share|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 9,
      "entry": "share v. A1, n. B1"
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
    "shortage|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 6,
      "entry": "shortage n. B2"
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
    "slice|v": {
      "level": "B1",
      "source": "oxford3000",
      "page": 9,
      "entry": "slice n., v. B1"
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
    "software|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 9,
      "entry": "software n. B1"
    },
    "soil|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 9,
      "entry": "soil n. B1"
    },
    "solar|adj": {
      "level": "B2",
      "source": "oxford3000",
      "page": 9,
      "entry": "solar adj. B2"
    },
    "space|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 10,
      "entry": "space n. A1"
    },
    "spam|n": {
      "level": "C1",
      "source": "oxford5000",
      "page": 7,
      "entry": "spam n. C1"
    },
    "species|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 10,
      "entry": "species n. B2"
    },
    "spice|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 7,
      "entry": "spice n. B2"
    },
    "spicy|adj": {
      "level": "B1",
      "source": "oxford3000",
      "page": 10,
      "entry": "spicy adj. B1"
    },
    "spread|v": {
      "level": "B1",
      "source": "oxford3000",
      "page": 10,
      "entry": "spread v. B1, n. B2"
    },
    "square|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 10,
      "entry": "square adj., n. A2"
    },
    "star|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 10,
      "entry": "star n. A1, v. A2"
    },
    "statement|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 10,
      "entry": "statement n. A1"
    },
    "station|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 10,
      "entry": "station n. A1"
    },
    "stir|v": {
      "level": "C1",
      "source": "oxford5000",
      "page": 7,
      "entry": "stir v. C1"
    },
    "storage|n": {
      "level": "C1",
      "source": "oxford5000",
      "page": 7,
      "entry": "storage n. C1"
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
    "stress|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 10,
      "entry": "stress n., v. A2"
    },
    "subject|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 10,
      "entry": "subject n. A1, adj. B2"
    },
    "suburb|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 7,
      "entry": "suburb n.B2"
    },
    "suit|v": {
      "level": "B1",
      "source": "oxford3000",
      "page": 10,
      "entry": "suit n. A2, v. B1"
    },
    "sun|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 10,
      "entry": "sun n. A1"
    },
    "supply|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 10,
      "entry": "supply n., v. B1"
    },
    "surgeon|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 7,
      "entry": "surgeon n. B2"
    },
    "surgery|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 10,
      "entry": "surgery n. B2"
    },
    "sustainable|adj": {
      "level": "B2",
      "source": "oxford5000",
      "page": 7,
      "entry": "sustainable adj. B2"
    },
    "swim|v": {
      "level": "A1",
      "source": "oxford3000",
      "page": 10,
      "entry": "swim v. A1, n. B1"
    },
    "symptom|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 10,
      "entry": "symptom n. B1"
    },
    "table|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 10,
      "entry": "table n. A1"
    },
    "tap|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 7,
      "entry": "tap v., n. B2"
    },
    "tax|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 10,
      "entry": "tax n., v. B1"
    },
    "technique|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 10,
      "entry": "technique n. B1"
    },
    "temperature|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 10,
      "entry": "temperature n. A2"
    },
    "tenant|n": {
      "level": "C1",
      "source": "oxford5000",
      "page": 7,
      "entry": "tenant n. C1"
    },
    "tender|adj": {
      "level": "C1",
      "source": "oxford5000",
      "page": 7,
      "entry": "tender adj. C1"
    },
    "term|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 10,
      "entry": "term n. A2, v. B2"
    },
    "test|v": {
      "level": "A1",
      "source": "oxford3000",
      "page": 10,
      "entry": "test n., v. A1"
    },
    "theory|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 10,
      "entry": "theory n. B1"
    },
    "therapy|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 10,
      "entry": "therapy n. B2"
    },
    "thesis|n": {
      "level": "B2",
      "source": "oxford5000",
      "page": 7,
      "entry": "thesis n. B2"
    },
    "threaten|v": {
      "level": "B2",
      "source": "oxford3000",
      "page": 10,
      "entry": "threaten v. B2"
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
    "tip|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 10,
      "entry": "tip n. A2, v. B1"
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
    "towel|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 10,
      "entry": "towel n. A2"
    },
    "trail|n": {
      "level": "C1",
      "source": "oxford5000",
      "page": 7,
      "entry": "trail n., v. C1"
    },
    "train|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 10,
      "entry": "train n. A1, v. A2"
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
    "trial|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 11,
      "entry": "trial n. B2"
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
    "update|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 11,
      "entry": "update v., n. B1"
    },
    "upgrade|v": {
      "level": "C1",
      "source": "oxford5000",
      "page": 7,
      "entry": "upgrade v., n. C1"
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
    "variable|n": {
      "level": "C1",
      "source": "oxford5000",
      "page": 8,
      "entry": "variable n., adj. C1"
    },
    "vehicle|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 11,
      "entry": "vehicle n. A2"
    },
    "vibrant|adj": {
      "level": "C1",
      "source": "oxford5000",
      "page": 8,
      "entry": "vibrant adj. C1"
    },
    "victim|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 11,
      "entry": "victim n. B1"
    },
    "village|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 11,
      "entry": "village n. A1"
    },
    "vote|v": {
      "level": "B1",
      "source": "oxford3000",
      "page": 11,
      "entry": "vote n., v. B1"
    },
    "wall|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 11,
      "entry": "wall n. A1"
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
    "waste|n": {
      "level": "B1",
      "source": "oxford3000",
      "page": 11,
      "entry": "waste n., v., adj. B1"
    },
    "wave|n": {
      "level": "A2",
      "source": "oxford3000",
      "page": 11,
      "entry": "wave n. A2, v. B1"
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
    "whisper|v": {
      "level": "B2",
      "source": "oxford3000",
      "page": 11,
      "entry": "whisper v., n. B2"
    },
    "wildlife|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 11,
      "entry": "wildlife n. B2"
    },
    "window|n": {
      "level": "A1",
      "source": "oxford3000",
      "page": 11,
      "entry": "window n. A1"
    },
    "witness|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 11,
      "entry": "witness n., v. B2"
    },
    "workout|n": {
      "level": "C1",
      "source": "oxford5000",
      "page": 8,
      "entry": "workout n. C1"
    },
    "wound|n": {
      "level": "B2",
      "source": "oxford3000",
      "page": 11,
      "entry": "wound n., v. B2"
    }
  }
};
  const lookup = (word, pos) => data.entries[String(word).normalize("NFKC").toLowerCase().trim()+"|"+pos] || null;
  return {...data, lookup};
})();
if(typeof module!=="undefined")module.exports=WordLevels;
