import type { City, Route, DestinationTicket } from './gameData.js';

export const INDIA_CITIES: City[] = [
  // Northern India
  { name: 'Srinagar', x: 340, y: 40 },
  { name: 'Shimla', x: 380, y: 120 },
  { name: 'Dehradun', x: 440, y: 110 },
  { name: 'Amritsar', x: 310, y: 120 },
  { name: 'Chandigarh', x: 370, y: 160 },
  { name: 'Delhi', x: 420, y: 230 },
  { name: 'Lucknow', x: 560, y: 270 },
  { name: 'Kanpur', x: 530, y: 300 },
  { name: 'Agra', x: 460, y: 290 },
  { name: 'Varanasi', x: 620, y: 310 },

  // Rajasthan & Western India
  { name: 'Jaipur', x: 360, y: 290 },
  { name: 'Jodhpur', x: 280, y: 330 },
  { name: 'Jaisalmer', x: 210, y: 310 },
  { name: 'Udaipur', x: 290, y: 390 },
  { name: 'Ahmedabad', x: 250, y: 450 },
  { name: 'Surat', x: 250, y: 530 },

  // Central India
  { name: 'Bhopal', x: 430, y: 400 },
  { name: 'Indore', x: 360, y: 430 },
  { name: 'Nagpur', x: 520, y: 450 },
  { name: 'Raipur', x: 590, y: 470 },

  // Western Coast & Maharashtra
  { name: 'Mumbai', x: 230, y: 590 },
  { name: 'Pune', x: 280, y: 610 },
  { name: 'Goa', x: 260, y: 690 },

  // Eastern India
  { name: 'Patna', x: 680, y: 290 },
  { name: 'Ranchi', x: 680, y: 370 },
  { name: 'Kolkata', x: 770, y: 370 },
  { name: 'Bhubaneswar', x: 710, y: 470 },
  { name: 'Darjeeling', x: 760, y: 250 },

  // Northeast India
  { name: 'Guwahati', x: 870, y: 270 },
  { name: 'Shillong', x: 910, y: 290 },
  { name: 'Imphal', x: 960, y: 330 },

  // South India — East Coast
  { name: 'Visakhapatnam', x: 650, y: 550 },
  { name: 'Hyderabad', x: 510, y: 570 },
  { name: 'Chennai', x: 560, y: 680 },

  // South India — Interior & West Coast
  { name: 'Bangalore', x: 450, y: 710 },
  { name: 'Mangalore', x: 340, y: 720 },
  { name: 'Coimbatore', x: 440, y: 770 },
  { name: 'Madurai', x: 480, y: 810 },
  { name: 'Kochi', x: 380, y: 810 },
  { name: 'Thiruvananthapuram', x: 390, y: 870 },
  { name: 'Kanyakumari', x: 420, y: 910 },
];

export const INDIA_ROUTES: Route[] = [
  // ===== NORTHERN INDIA =====
  // Kashmir & Himalayas
  { id: 'sri_amr', city1: 'Srinagar', city2: 'Amritsar', length: 3, color: 'GREEN', claimedBy: null },
  { id: 'sri_shi', city1: 'Srinagar', city2: 'Shimla', length: 4, color: 'WHITE', claimedBy: null },
  { id: 'amr_cha', city1: 'Amritsar', city2: 'Chandigarh', length: 2, color: 'ORANGE', claimedBy: null },
  { id: 'shi_cha', city1: 'Shimla', city2: 'Chandigarh', length: 1, color: 'GREY', claimedBy: null },
  { id: 'shi_deh', city1: 'Shimla', city2: 'Dehradun', length: 2, color: 'PURPLE', claimedBy: null },
  { id: 'deh_del', city1: 'Dehradun', city2: 'Delhi', length: 3, color: 'BLUE', claimedBy: null },
  { id: 'cha_del1', city1: 'Chandigarh', city2: 'Delhi', length: 3, color: 'RED', claimedBy: null },
  { id: 'cha_del2', city1: 'Chandigarh', city2: 'Delhi', length: 3, color: 'YELLOW', claimedBy: null },

  // Delhi Hub connections
  { id: 'del_agr', city1: 'Delhi', city2: 'Agra', length: 2, color: 'GREY', claimedBy: null },
  { id: 'del_jai1', city1: 'Delhi', city2: 'Jaipur', length: 3, color: 'ORANGE', claimedBy: null },
  { id: 'del_jai2', city1: 'Delhi', city2: 'Jaipur', length: 3, color: 'PURPLE', claimedBy: null },
  { id: 'del_luc1', city1: 'Delhi', city2: 'Lucknow', length: 4, color: 'BLACK', claimedBy: null },
  { id: 'del_luc2', city1: 'Delhi', city2: 'Lucknow', length: 4, color: 'WHITE', claimedBy: null },

  // UP & Bihar corridor
  { id: 'agr_jai', city1: 'Agra', city2: 'Jaipur', length: 2, color: 'YELLOW', claimedBy: null },
  { id: 'agr_kan', city1: 'Agra', city2: 'Kanpur', length: 2, color: 'BLUE', claimedBy: null },
  { id: 'agr_bho', city1: 'Agra', city2: 'Bhopal', length: 4, color: 'GREEN', claimedBy: null },
  { id: 'luc_kan', city1: 'Lucknow', city2: 'Kanpur', length: 1, color: 'GREY', claimedBy: null },
  { id: 'luc_var', city1: 'Lucknow', city2: 'Varanasi', length: 3, color: 'RED', claimedBy: null },
  { id: 'kan_var', city1: 'Kanpur', city2: 'Varanasi', length: 3, color: 'ORANGE', claimedBy: null },
  { id: 'var_pat', city1: 'Varanasi', city2: 'Patna', length: 3, color: 'BLUE', claimedBy: null },

  // ===== RAJASTHAN & WESTERN INDIA =====
  { id: 'jai_jod', city1: 'Jaipur', city2: 'Jodhpur', length: 3, color: 'RED', claimedBy: null },
  { id: 'jai_uda', city1: 'Jaipur', city2: 'Udaipur', length: 3, color: 'GREY', claimedBy: null },
  { id: 'jai_bho', city1: 'Jaipur', city2: 'Bhopal', length: 4, color: 'BLACK', claimedBy: null },
  { id: 'jod_jas', city1: 'Jodhpur', city2: 'Jaisalmer', length: 3, color: 'YELLOW', claimedBy: null },
  { id: 'jod_uda', city1: 'Jodhpur', city2: 'Udaipur', length: 2, color: 'PURPLE', claimedBy: null },
  { id: 'uda_ahm', city1: 'Udaipur', city2: 'Ahmedabad', length: 3, color: 'GREEN', claimedBy: null },
  { id: 'uda_ind', city1: 'Udaipur', city2: 'Indore', length: 3, color: 'ORANGE', claimedBy: null },
  { id: 'ahm_sur', city1: 'Ahmedabad', city2: 'Surat', length: 3, color: 'BLUE', claimedBy: null },
  { id: 'ahm_ind', city1: 'Ahmedabad', city2: 'Indore', length: 4, color: 'RED', claimedBy: null },
  { id: 'ahm_mum1', city1: 'Ahmedabad', city2: 'Mumbai', length: 5, color: 'YELLOW', claimedBy: null },
  { id: 'ahm_mum2', city1: 'Ahmedabad', city2: 'Mumbai', length: 5, color: 'BLACK', claimedBy: null },
  { id: 'sur_mum', city1: 'Surat', city2: 'Mumbai', length: 3, color: 'GREY', claimedBy: null },

  // ===== CENTRAL INDIA =====
  { id: 'bho_ind', city1: 'Bhopal', city2: 'Indore', length: 2, color: 'WHITE', claimedBy: null },
  { id: 'bho_nag', city1: 'Bhopal', city2: 'Nagpur', length: 3, color: 'PURPLE', claimedBy: null },
  { id: 'ind_mum', city1: 'Indore', city2: 'Mumbai', length: 5, color: 'GREEN', claimedBy: null },
  { id: 'nag_rai', city1: 'Nagpur', city2: 'Raipur', length: 3, color: 'YELLOW', claimedBy: null },
  { id: 'nag_hyd', city1: 'Nagpur', city2: 'Hyderabad', length: 4, color: 'ORANGE', claimedBy: null },
  { id: 'nag_pun', city1: 'Nagpur', city2: 'Pune', length: 5, color: 'BLUE', claimedBy: null },

  // ===== WESTERN COAST & MAHARASHTRA =====
  { id: 'mum_pun1', city1: 'Mumbai', city2: 'Pune', length: 1, color: 'GREY', claimedBy: null },
  { id: 'mum_pun2', city1: 'Mumbai', city2: 'Pune', length: 1, color: 'GREY', claimedBy: null },
  { id: 'pun_hyd', city1: 'Pune', city2: 'Hyderabad', length: 4, color: 'RED', claimedBy: null },
  { id: 'pun_goa', city1: 'Pune', city2: 'Goa', length: 3, color: 'WHITE', claimedBy: null },
  { id: 'pun_ban', city1: 'Pune', city2: 'Bangalore', length: 5, color: 'BLACK', claimedBy: null },
  { id: 'goa_man', city1: 'Goa', city2: 'Mangalore', length: 3, color: 'PURPLE', claimedBy: null },
  { id: 'goa_ban', city1: 'Goa', city2: 'Bangalore', length: 4, color: 'GREY', claimedBy: null },

  // ===== EASTERN INDIA =====
  { id: 'pat_ran', city1: 'Patna', city2: 'Ranchi', length: 3, color: 'GREEN', claimedBy: null },
  { id: 'pat_kol1', city1: 'Patna', city2: 'Kolkata', length: 4, color: 'PURPLE', claimedBy: null },
  { id: 'pat_kol2', city1: 'Patna', city2: 'Kolkata', length: 4, color: 'GREY', claimedBy: null },
  { id: 'pat_dar', city1: 'Patna', city2: 'Darjeeling', length: 4, color: 'ORANGE', claimedBy: null },
  { id: 'ran_kol', city1: 'Ranchi', city2: 'Kolkata', length: 3, color: 'RED', claimedBy: null },
  { id: 'ran_rai', city1: 'Ranchi', city2: 'Raipur', length: 3, color: 'WHITE', claimedBy: null },
  { id: 'ran_bhu', city1: 'Ranchi', city2: 'Bhubaneswar', length: 3, color: 'BLUE', claimedBy: null },
  { id: 'kol_bhu', city1: 'Kolkata', city2: 'Bhubaneswar', length: 4, color: 'YELLOW', claimedBy: null },
  { id: 'kol_dar', city1: 'Kolkata', city2: 'Darjeeling', length: 4, color: 'BLACK', claimedBy: null },
  { id: 'dar_guw', city1: 'Darjeeling', city2: 'Guwahati', length: 4, color: 'RED', claimedBy: null },

  // ===== NORTHEAST INDIA =====
  { id: 'kol_guw', city1: 'Kolkata', city2: 'Guwahati', length: 6, color: 'GREEN', claimedBy: null },
  { id: 'guw_shi', city1: 'Guwahati', city2: 'Shillong', length: 1, color: 'GREY', claimedBy: null },
  { id: 'shi_imp', city1: 'Shillong', city2: 'Imphal', length: 3, color: 'BLUE', claimedBy: null },
  { id: 'guw_imp', city1: 'Guwahati', city2: 'Imphal', length: 4, color: 'YELLOW', claimedBy: null },

  // ===== SOUTH INDIA — EAST COAST =====
  { id: 'bhu_vis', city1: 'Bhubaneswar', city2: 'Visakhapatnam', length: 3, color: 'GREY', claimedBy: null },
  { id: 'rai_vis', city1: 'Raipur', city2: 'Visakhapatnam', length: 4, color: 'BLACK', claimedBy: null },
  { id: 'vis_hyd', city1: 'Visakhapatnam', city2: 'Hyderabad', length: 4, color: 'WHITE', claimedBy: null },
  { id: 'vis_che', city1: 'Visakhapatnam', city2: 'Chennai', length: 5, color: 'GREEN', claimedBy: null },
  { id: 'hyd_che1', city1: 'Hyderabad', city2: 'Chennai', length: 4, color: 'BLUE', claimedBy: null },
  { id: 'hyd_che2', city1: 'Hyderabad', city2: 'Chennai', length: 4, color: 'ORANGE', claimedBy: null },
  { id: 'hyd_ban', city1: 'Hyderabad', city2: 'Bangalore', length: 4, color: 'GREY', claimedBy: null },

  // ===== SOUTH INDIA — INTERIOR & WEST COAST =====
  { id: 'ban_che1', city1: 'Bangalore', city2: 'Chennai', length: 3, color: 'YELLOW', claimedBy: null },
  { id: 'ban_che2', city1: 'Bangalore', city2: 'Chennai', length: 3, color: 'RED', claimedBy: null },
  { id: 'ban_man', city1: 'Bangalore', city2: 'Mangalore', length: 3, color: 'ORANGE', claimedBy: null },
  { id: 'ban_coi', city1: 'Bangalore', city2: 'Coimbatore', length: 3, color: 'WHITE', claimedBy: null },
  { id: 'man_koc', city1: 'Mangalore', city2: 'Kochi', length: 3, color: 'GREEN', claimedBy: null },
  { id: 'coi_koc', city1: 'Coimbatore', city2: 'Kochi', length: 2, color: 'PURPLE', claimedBy: null },
  { id: 'coi_mad', city1: 'Coimbatore', city2: 'Madurai', length: 2, color: 'GREY', claimedBy: null },
  { id: 'che_mad', city1: 'Chennai', city2: 'Madurai', length: 4, color: 'PURPLE', claimedBy: null },
  { id: 'mad_koc', city1: 'Madurai', city2: 'Kochi', length: 3, color: 'RED', claimedBy: null },
  { id: 'mad_thi', city1: 'Madurai', city2: 'Thiruvananthapuram', length: 3, color: 'BLUE', claimedBy: null },
  { id: 'koc_thi', city1: 'Kochi', city2: 'Thiruvananthapuram', length: 2, color: 'YELLOW', claimedBy: null },
  { id: 'thi_kan', city1: 'Thiruvananthapuram', city2: 'Kanyakumari', length: 1, color: 'GREY', claimedBy: null },
  { id: 'mad_kan', city1: 'Madurai', city2: 'Kanyakumari', length: 3, color: 'BLACK', claimedBy: null },

  // ===== CROSS-COUNTRY CONNECTORS =====
  { id: 'var_ran', city1: 'Varanasi', city2: 'Ranchi', length: 4, color: 'GREY', claimedBy: null },
  { id: 'kan_bho', city1: 'Kanpur', city2: 'Bhopal', length: 4, color: 'YELLOW', claimedBy: null },
  { id: 'rai_bhu', city1: 'Raipur', city2: 'Bhubaneswar', length: 4, color: 'ORANGE', claimedBy: null },
  { id: 'nag_var', city1: 'Nagpur', city2: 'Varanasi', length: 5, color: 'GREY', claimedBy: null },
  { id: 'ind_sur', city1: 'Indore', city2: 'Surat', length: 3, color: 'BLACK', claimedBy: null },
  { id: 'jas_ahm', city1: 'Jaisalmer', city2: 'Ahmedabad', length: 5, color: 'GREY', claimedBy: null },
];

export const INDIA_DESTINATION_TICKETS: DestinationTicket[] = [
  // Long-haul routes (14-22 points) — Cross-country epics
  { id: 'it1', city1: 'Srinagar', city2: 'Kanyakumari', points: 22 },
  { id: 'it2', city1: 'Amritsar', city2: 'Chennai', points: 20 },
  { id: 'it3', city1: 'Jaisalmer', city2: 'Imphal', points: 21 },
  { id: 'it4', city1: 'Delhi', city2: 'Kanyakumari', points: 18 },
  { id: 'it5', city1: 'Srinagar', city2: 'Kolkata', points: 17 },
  { id: 'it6', city1: 'Mumbai', city2: 'Kolkata', points: 15 },
  { id: 'it7', city1: 'Delhi', city2: 'Thiruvananthapuram', points: 16 },
  { id: 'it8', city1: 'Jaisalmer', city2: 'Kanyakumari', points: 20 },
  { id: 'it9', city1: 'Amritsar', city2: 'Bangalore', points: 15 },
  { id: 'it10', city1: 'Guwahati', city2: 'Mumbai', points: 17 },

  // Medium routes (8-13 points) — Regional journeys
  { id: 'it11', city1: 'Delhi', city2: 'Mumbai', points: 10 },
  { id: 'it12', city1: 'Delhi', city2: 'Kolkata', points: 10 },
  { id: 'it13', city1: 'Mumbai', city2: 'Chennai', points: 11 },
  { id: 'it14', city1: 'Kolkata', city2: 'Chennai', points: 12 },
  { id: 'it15', city1: 'Hyderabad', city2: 'Delhi', points: 11 },
  { id: 'it16', city1: 'Jaipur', city2: 'Hyderabad', points: 10 },
  { id: 'it17', city1: 'Bangalore', city2: 'Kolkata', points: 13 },
  { id: 'it18', city1: 'Mumbai', city2: 'Goa', points: 8 },
  { id: 'it19', city1: 'Patna', city2: 'Bangalore', points: 13 },
  { id: 'it20', city1: 'Nagpur', city2: 'Kochi', points: 12 },

  // Short routes (4-7 points) — Quick connections
  { id: 'it21', city1: 'Delhi', city2: 'Agra', points: 4 },
  { id: 'it22', city1: 'Mumbai', city2: 'Pune', points: 4 },
  { id: 'it23', city1: 'Bangalore', city2: 'Chennai', points: 5 },
  { id: 'it24', city1: 'Kolkata', city2: 'Darjeeling', points: 5 },
  { id: 'it25', city1: 'Lucknow', city2: 'Varanasi', points: 5 },
  { id: 'it26', city1: 'Kochi', city2: 'Kanyakumari', points: 5 },
  { id: 'it27', city1: 'Ahmedabad', city2: 'Jaipur', points: 7 },
  { id: 'it28', city1: 'Chandigarh', city2: 'Lucknow', points: 7 },
  { id: 'it29', city1: 'Guwahati', city2: 'Imphal', points: 6 },
  { id: 'it30', city1: 'Ranchi', city2: 'Nagpur', points: 7 },
];
