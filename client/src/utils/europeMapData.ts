import type { City, Route, DestinationTicket } from './gameData.js';

export const EUROPE_CITIES: City[] = [
  {
    "name": "Lisboa",
    "x": 30,
    "y": 740
  },
  {
    "name": "Cadiz",
    "x": 30,
    "y": 860
  },
  {
    "name": "Madrid",
    "x": 150,
    "y": 780
  },
  {
    "name": "Barcelona",
    "x": 250,
    "y": 740
  },
  {
    "name": "Pamplona",
    "x": 140,
    "y": 630
  },
  {
    "name": "Marseille",
    "x": 405,
    "y": 680
  },
  {
    "name": "Paris",
    "x": 220,
    "y": 450
  },
  {
    "name": "Brest",
    "x": 40,
    "y": 470
  },
  {
    "name": "Dieppe",
    "x": 140,
    "y": 380
  },
  {
    "name": "Zurich",
    "x": 340,
    "y": 520
  },
  {
    "name": "London",
    "x": 150,
    "y": 230
  },
  {
    "name": "Edinburgh",
    "x": 50,
    "y": 60
  },
  {
    "name": "Venezia",
    "x": 440,
    "y": 570
  },
  {
    "name": "Roma",
    "x": 580,
    "y": 630
  },
  {
    "name": "Munchen",
    "x": 430,
    "y": 470
  },
  {
    "name": "Frankfurt",
    "x": 380,
    "y": 390
  },
  {
    "name": "Bruxelles",
    "x": 270,
    "y": 340
  },
  {
    "name": "Amsterdam",
    "x": 290,
    "y": 260
  },
  {
    "name": "Essen",
    "x": 450,
    "y": 240
  },
  {
    "name": "Berlin",
    "x": 551,
    "y": 290
  },
  {
    "name": "Wien",
    "x": 570,
    "y": 450
  },
  {
    "name": "Zagrab",
    "x": 550,
    "y": 540
  },
  {
    "name": "Budapest",
    "x": 674,
    "y": 485
  },
  {
    "name": "Brindisi",
    "x": 630,
    "y": 740
  },
  {
    "name": "Palermo",
    "x": 510,
    "y": 850
  },
  {
    "name": "Sarajevo",
    "x": 660,
    "y": 608
  },
  {
    "name": "Athina",
    "x": 776,
    "y": 807
  },
  {
    "name": "Sofia",
    "x": 776,
    "y": 647
  },
  {
    "name": "Smyrna",
    "x": 850,
    "y": 792
  },
  {
    "name": "Constantinople",
    "x": 890,
    "y": 704
  },
  {
    "name": "Bucuresti",
    "x": 827,
    "y": 589
  },
  {
    "name": "Kyiv",
    "x": 924,
    "y": 370
  },
  {
    "name": "Warzawa",
    "x": 717,
    "y": 310
  },
  {
    "name": "Sevastopol",
    "x": 988,
    "y": 583
  },
  {
    "name": "Angora",
    "x": 974,
    "y": 741
  },
  {
    "name": "Erzurum",
    "x": 1157,
    "y": 741
  },
  {
    "name": "Sochi",
    "x": 1124,
    "y": 617
  },
  {
    "name": "Rostov",
    "x": 1123,
    "y": 494
  },
  {
    "name": "Kharkov",
    "x": 1048,
    "y": 401
  },
  {
    "name": "Moskva",
    "x": 1078,
    "y": 180
  },
  {
    "name": "Smolensk",
    "x": 957,
    "y": 210
  },
  {
    "name": "Wilno",
    "x": 850,
    "y": 285
  },
  {
    "name": "Petrograd",
    "x": 919,
    "y": 50
  },
  {
    "name": "Stockholm",
    "x": 535,
    "y": 60
  },
  {
    "name": "Riga",
    "x": 740,
    "y": 120
  },
  {
    "name": "Danzic",
    "x": 665,
    "y": 230
  },
  {
    "name": "Khobenhaven",
    "x": 350,
    "y": 80
  }
];

export const EUROPE_ROUTES: Route[] = [
  {
    "id": "lis_cad",
    "city1": "Lisboa",
    "city2": "Cadiz",
    "length": 2,
    "color": "BLUE",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "mad_lis",
    "city1": "Madrid",
    "city2": "Lisboa",
    "length": 3,
    "color": "PURPLE",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "mad_cad",
    "city1": "Madrid",
    "city2": "Cadiz",
    "length": 3,
    "color": "ORANGE",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "mad_pam1",
    "city1": "Madrid",
    "city2": "Pamplona",
    "length": 3,
    "color": "BLACK",
    "isTunnel": true,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "mad_pam2",
    "city1": "Madrid",
    "city2": "Pamplona",
    "length": 3,
    "color": "WHITE",
    "isTunnel": true,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "mad_bar",
    "city1": "Madrid",
    "city2": "Barcelona",
    "length": 2,
    "color": "YELLOW",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "mar_pam",
    "city1": "Marseille",
    "city2": "Pamplona",
    "length": 4,
    "color": "RED",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "mar_bar",
    "city1": "Marseille",
    "city2": "Barcelona",
    "length": 4,
    "color": "GREY",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "pam_bar",
    "city1": "Pamplona",
    "city2": "Barcelona",
    "length": 2,
    "color": "GREY",
    "isTunnel": true,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "pam_bre",
    "city1": "Pamplona",
    "city2": "Brest",
    "length": 4,
    "color": "PURPLE",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "par_pam1",
    "city1": "Paris",
    "city2": "Pamplona",
    "length": 4,
    "color": "BLUE",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "par_pam2",
    "city1": "Paris",
    "city2": "Pamplona",
    "length": 4,
    "color": "GREEN",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "par_mar",
    "city1": "Paris",
    "city2": "Marseille",
    "length": 4,
    "color": "GREY",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "par_bre",
    "city1": "Paris",
    "city2": "Brest",
    "length": 3,
    "color": "BLACK",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "par_die",
    "city1": "Paris",
    "city2": "Dieppe",
    "length": 1,
    "color": "PURPLE",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "par_zur",
    "city1": "Paris",
    "city2": "Zurich",
    "length": 3,
    "color": "GREY",
    "isTunnel": true,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "die_lon1",
    "city1": "Dieppe",
    "city2": "London",
    "length": 2,
    "color": "GREY",
    "isTunnel": false,
    "requiredEngines": 1,
    "claimedBy": null
  },
  {
    "id": "die_lon2",
    "city1": "Dieppe",
    "city2": "London",
    "length": 2,
    "color": "GREY",
    "isTunnel": false,
    "requiredEngines": 1,
    "claimedBy": null
  },
  {
    "id": "die_bre",
    "city1": "Dieppe",
    "city2": "Brest",
    "length": 2,
    "color": "ORANGE",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "lon_edi1",
    "city1": "London",
    "city2": "Edinburgh",
    "length": 4,
    "color": "ORANGE",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "lon_edi2",
    "city1": "London",
    "city2": "Edinburgh",
    "length": 4,
    "color": "BLACK",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "zur_mar",
    "city1": "Zurich",
    "city2": "Marseille",
    "length": 2,
    "color": "PURPLE",
    "isTunnel": true,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "zur_ven",
    "city1": "Zurich",
    "city2": "Venezia",
    "length": 2,
    "color": "GREEN",
    "isTunnel": true,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "mar_rom",
    "city1": "Marseille",
    "city2": "Roma",
    "length": 4,
    "color": "GREY",
    "isTunnel": true,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "ven_rom",
    "city1": "Venezia",
    "city2": "Roma",
    "length": 2,
    "color": "BLACK",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "zur_mun",
    "city1": "Zurich",
    "city2": "Munchen",
    "length": 2,
    "color": "YELLOW",
    "isTunnel": true,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "mun_ven",
    "city1": "Munchen",
    "city2": "Venezia",
    "length": 2,
    "color": "BLUE",
    "isTunnel": true,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "mun_fra",
    "city1": "Munchen",
    "city2": "Frankfurt",
    "length": 2,
    "color": "PURPLE",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "fra_par1",
    "city1": "Frankfurt",
    "city2": "Paris",
    "length": 3,
    "color": "WHITE",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "fra_par2",
    "city1": "Frankfurt",
    "city2": "Paris",
    "length": 3,
    "color": "ORANGE",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "fra_bru",
    "city1": "Frankfurt",
    "city2": "Bruxelles",
    "length": 2,
    "color": "BLUE",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "bru_par1",
    "city1": "Bruxelles",
    "city2": "Paris",
    "length": 2,
    "color": "YELLOW",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "bru_par2",
    "city1": "Bruxelles",
    "city2": "Paris",
    "length": 2,
    "color": "RED",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "bru_die",
    "city1": "Bruxelles",
    "city2": "Dieppe",
    "length": 2,
    "color": "GREEN",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "bru_ams",
    "city1": "Bruxelles",
    "city2": "Amsterdam",
    "length": 1,
    "color": "BLACK",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "ams_lon",
    "city1": "Amsterdam",
    "city2": "London",
    "length": 2,
    "color": "GREY",
    "isTunnel": false,
    "requiredEngines": 2,
    "claimedBy": null
  },
  {
    "id": "ams_fra",
    "city1": "Amsterdam",
    "city2": "Frankfurt",
    "length": 2,
    "color": "WHITE",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "fra_ess",
    "city1": "Frankfurt",
    "city2": "Essen",
    "length": 2,
    "color": "GREEN",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "ams_ess",
    "city1": "Amsterdam",
    "city2": "Essen",
    "length": 3,
    "color": "YELLOW",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "mun_wie",
    "city1": "Munchen",
    "city2": "Wien",
    "length": 3,
    "color": "ORANGE",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "ber_wie",
    "city1": "Berlin",
    "city2": "Wien",
    "length": 3,
    "color": "GREEN",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "ber_ess",
    "city1": "Berlin",
    "city2": "Essen",
    "length": 2,
    "color": "BLUE",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "ber_fra1",
    "city1": "Berlin",
    "city2": "Frankfurt",
    "length": 3,
    "color": "RED",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "ber_fra2",
    "city1": "Berlin",
    "city2": "Frankfurt",
    "length": 3,
    "color": "BLACK",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "wie_zag",
    "city1": "Wien",
    "city2": "Zagrab",
    "length": 2,
    "color": "GREY",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "zag_ven",
    "city1": "Zagrab",
    "city2": "Venezia",
    "length": 2,
    "color": "GREY",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "rom_bri",
    "city1": "Roma",
    "city2": "Brindisi",
    "length": 2,
    "color": "WHITE",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "rom_pal",
    "city1": "Roma",
    "city2": "Palermo",
    "length": 4,
    "color": "GREY",
    "isTunnel": false,
    "requiredEngines": 1,
    "claimedBy": null
  },
  {
    "id": "bri_pal",
    "city1": "Brindisi",
    "city2": "Palermo",
    "length": 3,
    "color": "GREY",
    "isTunnel": false,
    "requiredEngines": 1,
    "claimedBy": null
  },
  {
    "id": "bud_zag",
    "city1": "Budapest",
    "city2": "Zagrab",
    "length": 2,
    "color": "ORANGE",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "bud_wie1",
    "city1": "Budapest",
    "city2": "Wien",
    "length": 1,
    "color": "RED",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "bud_wie2",
    "city1": "Budapest",
    "city2": "Wien",
    "length": 1,
    "color": "WHITE",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "zag_sar",
    "city1": "Zagrab",
    "city2": "Sarajevo",
    "length": 3,
    "color": "RED",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "sar_ath",
    "city1": "Sarajevo",
    "city2": "Athina",
    "length": 4,
    "color": "GREEN",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "bud_sar",
    "city1": "Budapest",
    "city2": "Sarajevo",
    "length": 3,
    "color": "PURPLE",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "bri_ath",
    "city1": "Brindisi",
    "city2": "Athina",
    "length": 4,
    "color": "GREY",
    "isTunnel": false,
    "requiredEngines": 1,
    "claimedBy": null
  },
  {
    "id": "ath_sof",
    "city1": "Athina",
    "city2": "Sofia",
    "length": 3,
    "color": "PURPLE",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "sof_sar",
    "city1": "Sofia",
    "city2": "Sarajevo",
    "length": 2,
    "color": "GREY",
    "isTunnel": true,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "sof_con",
    "city1": "Sofia",
    "city2": "Constantinople",
    "length": 3,
    "color": "BLUE",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "ath_smy",
    "city1": "Athina",
    "city2": "Smyrna",
    "length": 2,
    "color": "GREY",
    "isTunnel": false,
    "requiredEngines": 1,
    "claimedBy": null
  },
  {
    "id": "smy_con",
    "city1": "Smyrna",
    "city2": "Constantinople",
    "length": 2,
    "color": "GREY",
    "isTunnel": true,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "con_buc",
    "city1": "Constantinople",
    "city2": "Bucuresti",
    "length": 3,
    "color": "YELLOW",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "buc_sof",
    "city1": "Bucuresti",
    "city2": "Sofia",
    "length": 2,
    "color": "GREY",
    "isTunnel": true,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "buc_bud",
    "city1": "Bucuresti",
    "city2": "Budapest",
    "length": 4,
    "color": "GREY",
    "isTunnel": true,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "bud_kyi",
    "city1": "Budapest",
    "city2": "Kyiv",
    "length": 6,
    "color": "GREY",
    "isTunnel": true,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "buc_kyi",
    "city1": "Bucuresti",
    "city2": "Kyiv",
    "length": 4,
    "color": "GREY",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "kyi_war",
    "city1": "Kyiv",
    "city2": "Warzawa",
    "length": 4,
    "color": "GREY",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "war_ber1",
    "city1": "Warzawa",
    "city2": "Berlin",
    "length": 4,
    "color": "PURPLE",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "war_ber2",
    "city1": "Warzawa",
    "city2": "Berlin",
    "length": 4,
    "color": "YELLOW",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "war_wie",
    "city1": "Warzawa",
    "city2": "Wien",
    "length": 4,
    "color": "BLUE",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "con_ang",
    "city1": "Constantinople",
    "city2": "Angora",
    "length": 2,
    "color": "GREY",
    "isTunnel": true,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "smy_ang",
    "city1": "Smyrna",
    "city2": "Angora",
    "length": 3,
    "color": "ORANGE",
    "isTunnel": true,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "ang_erz",
    "city1": "Angora",
    "city2": "Erzurum",
    "length": 3,
    "color": "BLACK",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "sev_con",
    "city1": "Sevastopol",
    "city2": "Constantinople",
    "length": 4,
    "color": "GREY",
    "isTunnel": false,
    "requiredEngines": 2,
    "claimedBy": null
  },
  {
    "id": "sev_erz",
    "city1": "Sevastopol",
    "city2": "Erzurum",
    "length": 4,
    "color": "GREY",
    "isTunnel": false,
    "requiredEngines": 2,
    "claimedBy": null
  },
  {
    "id": "soc_erz",
    "city1": "Sochi",
    "city2": "Erzurum",
    "length": 3,
    "color": "RED",
    "isTunnel": true,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "sev_soc",
    "city1": "Sevastopol",
    "city2": "Sochi",
    "length": 2,
    "color": "GREY",
    "isTunnel": false,
    "requiredEngines": 1,
    "claimedBy": null
  },
  {
    "id": "soc_ros",
    "city1": "Sochi",
    "city2": "Rostov",
    "length": 2,
    "color": "GREY",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "sev_ros",
    "city1": "Sevastopol",
    "city2": "Rostov",
    "length": 4,
    "color": "GREY",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "ros_kha",
    "city1": "Rostov",
    "city2": "Kharkov",
    "length": 2,
    "color": "GREEN",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "kha_kyi",
    "city1": "Kharkov",
    "city2": "Kyiv",
    "length": 4,
    "color": "GREY",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "kha_mos",
    "city1": "Kharkov",
    "city2": "Moskva",
    "length": 4,
    "color": "GREY",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "sev_buc",
    "city1": "Sevastopol",
    "city2": "Bucuresti",
    "length": 4,
    "color": "WHITE",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "mos_smo",
    "city1": "Moskva",
    "city2": "Smolensk",
    "length": 2,
    "color": "ORANGE",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "mos_pet",
    "city1": "Moskva",
    "city2": "Petrograd",
    "length": 4,
    "color": "WHITE",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "pet_wil",
    "city1": "Petrograd",
    "city2": "Wilno",
    "length": 4,
    "color": "BLUE",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "pet_rig",
    "city1": "Petrograd",
    "city2": "Riga",
    "length": 4,
    "color": "GREY",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "pet_sto",
    "city1": "Petrograd",
    "city2": "Stockholm",
    "length": 8,
    "color": "GREY",
    "isTunnel": true,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "sto_kho1",
    "city1": "Stockholm",
    "city2": "Khobenhaven",
    "length": 3,
    "color": "YELLOW",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "sto_kho2",
    "city1": "Stockholm",
    "city2": "Khobenhaven",
    "length": 3,
    "color": "WHITE",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "kho_ess1",
    "city1": "Khobenhaven",
    "city2": "Essen",
    "length": 3,
    "color": "GREY",
    "isTunnel": false,
    "requiredEngines": 1,
    "claimedBy": null
  },
  {
    "id": "kho_ess2",
    "city1": "Khobenhaven",
    "city2": "Essen",
    "length": 3,
    "color": "GREY",
    "isTunnel": false,
    "requiredEngines": 1,
    "claimedBy": null
  },
  {
    "id": "rig_dan",
    "city1": "Riga",
    "city2": "Danzic",
    "length": 3,
    "color": "BLACK",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "dan_ber",
    "city1": "Danzic",
    "city2": "Berlin",
    "length": 3,
    "color": "GREY",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "dan_war",
    "city1": "Danzic",
    "city2": "Warzawa",
    "length": 2,
    "color": "GREY",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "war_wil",
    "city1": "Warzawa",
    "city2": "Wilno",
    "length": 3,
    "color": "RED",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "wil_rig",
    "city1": "Wilno",
    "city2": "Riga",
    "length": 4,
    "color": "GREEN",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "wil_smo",
    "city1": "Wilno",
    "city2": "Smolensk",
    "length": 3,
    "color": "YELLOW",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "wil_kyi",
    "city1": "Wilno",
    "city2": "Kyiv",
    "length": 2,
    "color": "GREY",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "smo_kyi",
    "city1": "Smolensk",
    "city2": "Kyiv",
    "length": 3,
    "color": "RED",
    "isTunnel": false,
    "requiredEngines": 0,
    "claimedBy": null
  },
  {
    "id": "pal_ath",
    "city1": "Palermo",
    "city2": "Athina",
    "length": 6,
    "color": "GREY",
    "isTunnel": false,
    "requiredEngines": 2,
    "claimedBy": null
  }
];

export const EUROPE_DESTINATION_TICKETS: DestinationTicket[] = [
  {
    "id": "et1",
    "city1": "Venezia",
    "city2": "Constantinople",
    "points": 10
  },
  {
    "id": "et2",
    "city1": "London",
    "city2": "Wien",
    "points": 10
  },
  {
    "id": "et3",
    "city1": "Angora",
    "city2": "Kharkov",
    "points": 10
  },
  {
    "id": "et4",
    "city1": "Essen",
    "city2": "Kyiv",
    "points": 10
  },
  {
    "id": "et5",
    "city1": "Riga",
    "city2": "Bucuresti",
    "points": 10
  },
  {
    "id": "et6",
    "city1": "Stockholm",
    "city2": "Wien",
    "points": 10
  },
  {
    "id": "et7",
    "city1": "Athina",
    "city2": "Wilno",
    "points": 11
  },
  {
    "id": "et8",
    "city1": "Amsterdam",
    "city2": "Wilno",
    "points": 12
  },
  {
    "id": "et9",
    "city1": "Berlin",
    "city2": "Moskva",
    "points": 12
  },
  {
    "id": "et10",
    "city1": "Frankfurt",
    "city2": "Smolensk",
    "points": 13
  },
  {
    "id": "et11",
    "city1": "Roma",
    "city2": "Smyrna",
    "points": 8
  },
  {
    "id": "et12",
    "city1": "Madrid",
    "city2": "Zurich",
    "points": 8
  },
  {
    "id": "et13",
    "city1": "Paris",
    "city2": "Wien",
    "points": 8
  },
  {
    "id": "et14",
    "city1": "Brest",
    "city2": "Venezia",
    "points": 8
  },
  {
    "id": "et15",
    "city1": "Palermo",
    "city2": "Constantinople",
    "points": 8
  },
  {
    "id": "et16",
    "city1": "Madrid",
    "city2": "Dieppe",
    "points": 8
  },
  {
    "id": "et17",
    "city1": "Berlin",
    "city2": "Bucuresti",
    "points": 8
  },
  {
    "id": "et18",
    "city1": "Barcelona",
    "city2": "Bruxelles",
    "points": 8
  },
  {
    "id": "et19",
    "city1": "Berlin",
    "city2": "Roma",
    "points": 9
  },
  {
    "id": "et20",
    "city1": "Bruxelles",
    "city2": "Danzic",
    "points": 9
  },
  {
    "id": "et21",
    "city1": "Paris",
    "city2": "Zagrab",
    "points": 7
  },
  {
    "id": "et22",
    "city1": "Amsterdam",
    "city2": "Pamplona",
    "points": 7
  },
  {
    "id": "et23",
    "city1": "London",
    "city2": "Berlin",
    "points": 7
  },
  {
    "id": "et24",
    "city1": "Brest",
    "city2": "Marseille",
    "points": 7
  },
  {
    "id": "et25",
    "city1": "Edinburgh",
    "city2": "Paris",
    "points": 7
  },
  {
    "id": "et26",
    "city1": "Marseille",
    "city2": "Essen",
    "points": 8
  },
  {
    "id": "et27",
    "city1": "Smolensk",
    "city2": "Rostov",
    "points": 8
  },
  {
    "id": "et28",
    "city1": "Barcelona",
    "city2": "Munchen",
    "points": 8
  },
  {
    "id": "et29",
    "city1": "Sarajevo",
    "city2": "Sevastopol",
    "points": 8
  },
  {
    "id": "et30",
    "city1": "Kyiv",
    "city2": "Sochi",
    "points": 8
  },
  {
    "id": "et31",
    "city1": "Athina",
    "city2": "Angora",
    "points": 5
  },
  {
    "id": "et32",
    "city1": "Sofia",
    "city2": "Smyrna",
    "points": 5
  },
  {
    "id": "et33",
    "city1": "Frankfurt",
    "city2": "Khobenhaven",
    "points": 5
  },
  {
    "id": "et34",
    "city1": "Budapest",
    "city2": "Sofia",
    "points": 5
  },
  {
    "id": "et35",
    "city1": "Rostov",
    "city2": "Erzurum",
    "points": 5
  },
  {
    "id": "et36",
    "city1": "Warzawa",
    "city2": "Smolensk",
    "points": 6
  },
  {
    "id": "et37",
    "city1": "Zurich",
    "city2": "Brindisi",
    "points": 6
  },
  {
    "id": "et38",
    "city1": "Zagrab",
    "city2": "Brindisi",
    "points": 6
  },
  {
    "id": "et39",
    "city1": "Kyiv",
    "city2": "Petrograd",
    "points": 6
  },
  {
    "id": "et40",
    "city1": "Zurich",
    "city2": "Budapest",
    "points": 6
  },
  {
    "id": "et41",
    "city1": "Palermo",
    "city2": "Moskva",
    "points": 20
  },
  {
    "id": "et42",
    "city1": "Brest",
    "city2": "Petrograd",
    "points": 20
  },
  {
    "id": "et43",
    "city1": "Lisboa",
    "city2": "Danzic",
    "points": 20
  },
  {
    "id": "et44",
    "city1": "Edinburgh",
    "city2": "Athina",
    "points": 21
  },
  {
    "id": "et45",
    "city1": "Cadiz",
    "city2": "Stockholm",
    "points": 21
  },
  {
    "id": "et46",
    "city1": "Khobenhaven",
    "city2": "Erzurum",
    "points": 21
  }
];
