import { PrismaClient, ProductStatus } from '@prisma/client'
const prisma = new PrismaClient()

const BASE = 'https://www.sanitary.pk/admin/assets/uploaded_images/'

const products = [
  // ── Complete Single Lever Bath Sets ──────────────────────────────
  { name:'Complete Echo Tech Lever SET Bathroom Sanitary Fittings Set code 3099A', sku:'COMP-001', price:62502, salePrice:56252, stock:5, featured:true, brand:'master-sanitary', cat:'bathroom-fittings', img:'Eco-Tech-Lever-set-3099A-master-sanitary-fittings.jpg', desc:'Complete Single Lever Bath Set' },
  { name:'Complete Single Lever Aqua Bathroom Shower Set S-6021-6023 Sonex Sanitary Fittings', sku:'COMP-002', price:67747, salePrice:null, stock:12, featured:true, brand:'sonex', cat:'bathroom-fittings', img:'Aqua_Final.jpg', desc:'Complete Single Lever Bath Set' },
  { name:'Complete Single Lever INDUS SET S-5331-5233 SONEX', sku:'COMP-003', price:68326, salePrice:61493, stock:19, featured:true, brand:'sonex', cat:'bathroom-fittings', img:'Indus_Final.jpg', desc:'Complete Single Lever Bath Set' },
  { name:'Complete Single Lever Sarina Bathroom Shower Set S-6021-6023 Sonex Sanitary Fittings', sku:'COMP-004', price:69552, salePrice:null, stock:26, featured:true, brand:'sonex', cat:'bathroom-fittings', img:'Swift_Final.jpg', desc:'Complete Single Lever Bath Set' },
  { name:'Complete Single Lever Sarina Bathroom Shower Set S-7091-7093 Sonex Sanitary Fittings', sku:'COMP-005', price:69552, salePrice:62597, stock:33, featured:true, brand:'sonex', cat:'bathroom-fittings', img:'Sarina_Final.jpg', desc:'Complete Single Lever Bath Set' },
  { name:'Complete Single Lever DOAAB SET S-651-653 SONEX', sku:'COMP-006', price:69552, salePrice:null, stock:10, featured:true, brand:'sonex', cat:'bathroom-fittings', img:'Doaab_Set_Final.jpg', desc:'Complete Single Lever Bath Set' },
  { name:'Complete Single Lever Classic Bathroom Shower Set S-7091-7093 Sonex Sanitary Fittings', sku:'COMP-007', price:69593, salePrice:62634, stock:17, featured:true, brand:'sonex', cat:'bathroom-fittings', img:'Classic_Final.jpg', desc:'Complete Single Lever Bath Set' },
  { name:'Complete Single Lever Paradise Bathroom Shower Set S-5151-5153 Sonex Sanitary Fittings', sku:'COMP-008', price:71254, salePrice:null, stock:24, featured:true, brand:'sonex', cat:'bathroom-fittings', img:'Paradise_Final.jpg', desc:'Complete Single Lever Bath Set' },
  { name:'Complete Project Lever Set Code 5807', sku:'COMP-009', price:71650, salePrice:64485, stock:31, featured:true, brand:'faisal-sanitary', cat:'bathroom-fittings', img:'sample-1-with-watermark.jpg', desc:'Complete Single Lever Bath Set' },
  { name:'Complete ARAGON SET Bathroom Sanitary Fittings Set code 3078A', sku:'COMP-010', price:71705, salePrice:null, stock:8, featured:true, brand:'master-sanitary', cat:'bathroom-fittings', img:'Aragon-set-3078A-master-sanitary-fittings.jpg', desc:'Complete Single Lever Bath Set' },
  { name:'Complete REMIX SET Bathroom Sanitary Fittings Set code 3096A', sku:'COMP-011', price:71705, salePrice:64535, stock:15, featured:true, brand:'master-sanitary', cat:'bathroom-fittings', img:'master-sanitary-fittings-Remix-set-3096A.jpg', desc:'Complete Single Lever Bath Set' },
  { name:'Complete Single Lever DRIZAL Bathroom Shower Set S-3171-3173 Sonex Sanitary Fittings', sku:'COMP-012', price:71861, salePrice:null, stock:22, featured:true, brand:'sonex', cat:'bathroom-fittings', img:'Drizal_Final2.jpg', desc:'Complete Single Lever Bath Set' },
  { name:'Complete Single Lever CAPRI Bathroom Shower Set S-7711-7713 Sonex Sanitary Fittings', sku:'COMP-013', price:71877, salePrice:64689, stock:29, featured:false, brand:'sonex', cat:'bathroom-fittings', img:'Sawana_Final.jpg', desc:'Complete Single Lever Bath Set' },
  { name:'Complete Single Lever ONIDA SET S-6011-6013 SONEX', sku:'COMP-014', price:73149, salePrice:null, stock:6, featured:false, brand:'sonex', cat:'bathroom-fittings', img:'Onida_Final.jpg', desc:'Complete Single Lever Bath Set' },
  { name:'Complete Single Lever SEAGULL Bathroom Shower Set S-5061-5063 Sonex Sanitary Fittings', sku:'COMP-015', price:80868, salePrice:72781, stock:13, featured:false, brand:'sonex', cat:'bathroom-fittings', img:'Seagull_Final.jpg', desc:'Complete Single Lever Bath Set' },
  { name:'Complete Single Lever DISTAL Bathroom Shower Set S-3141-3143 Sonex Sanitary Fittings', sku:'COMP-016', price:80898, salePrice:null, stock:20, featured:false, brand:'sonex', cat:'bathroom-fittings', img:'Distal_Final.jpg', desc:'Complete Single Lever Bath Set' },
  { name:'Complete Single Lever LAKE Bathroom Shower SET S-5171-5173 Sonex Sanitary Fittings', sku:'COMP-017', price:82276, salePrice:74048, stock:27, featured:false, brand:'sonex', cat:'bathroom-fittings', img:'Lake_Final.jpg', desc:'Complete Single Lever Bath Set' },
  { name:'Kia Single Lever Complete Shower set Code 7407 Faisal', sku:'COMP-018', price:82363, salePrice:null, stock:34, featured:false, brand:'faisal-sanitary', cat:'bathroom-fittings', img:'Kia_Single_Lever_Complate_Shower_set_Code_7407_Faisal_Sanitary.jpg', desc:'Complete Single Lever Bath Set' },
  // ── Basin Mixers ─────────────────────────────────────────────────
  { name:'Economy Basin Mixer Code 6001 Faisal Sanitary', sku:'BAMI-019', price:12192, salePrice:10973, stock:11, featured:false, brand:'faisal-sanitary', cat:'bathroom-fittings', img:'Basin-Mixer44.jpg', desc:'Basin Mixers' },
  { name:'Project Basin Mixer Code 5101 Faisal Sanitary', sku:'BAMI-020', price:14759, salePrice:null, stock:18, featured:false, brand:'faisal-sanitary', cat:'bathroom-fittings', img:'Basin-Mixer45.jpg', desc:'Basin Mixers' },
  { name:'Ocean Basin Mixer Code 3001 Faisal Sanitary', sku:'BAMI-021', price:14927, salePrice:13434, stock:25, featured:false, brand:'faisal-sanitary', cat:'bathroom-fittings', img:'Basin-Mixer50.jpg', desc:'Basin Mixers' },
  { name:'Omega Basin Mixer Code 2301 Faisal Sanitary', sku:'BAMI-022', price:14948, salePrice:null, stock:32, featured:false, brand:'faisal-sanitary', cat:'bathroom-fittings', img:'Basin-Mixer51.jpg', desc:'Basin Mixers' },
  { name:'Star Basin Mixer Code 2501 Faisal Sanitary', sku:'BAMI-023', price:15162, salePrice:13646, stock:9, featured:false, brand:'faisal-sanitary', cat:'bathroom-fittings', img:'Basin-Mixer53.jpg', desc:'Basin Mixers' },
  { name:'Lever Project Basin Mixer Code 5801 Faisal Sanitary', sku:'BAMI-024', price:15355, salePrice:null, stock:16, featured:false, brand:'faisal-sanitary', cat:'bathroom-fittings', img:'basin-mixer38.jpg', desc:'Basin Mixers' },
  { name:'Askari Basin Mixer Code 3701 Faisal Sanitary', sku:'BAMI-025', price:16705, salePrice:15035, stock:23, featured:false, brand:'faisal-sanitary', cat:'bathroom-fittings', img:'Basin-Mixer55.jpg', desc:'Basin Mixers' },
  { name:'Classic Basin Mixer Code 3101 Faisal Sanitary', sku:'BAMI-026', price:17013, salePrice:null, stock:30, featured:false, brand:'faisal-sanitary', cat:'bathroom-fittings', img:'Basin-Mixer56.jpg', desc:'Basin Mixers' },
  { name:'Mega Basin Mixer Code 4001 Faisal Sanitary', sku:'BAMI-027', price:17268, salePrice:15541, stock:7, featured:false, brand:'faisal-sanitary', cat:'bathroom-fittings', img:'Basin-Mixer57.jpg', desc:'Basin Mixers' },
  { name:'Aqua Basin Mixer Code 4301 Faisal Sanitary', sku:'BAMI-028', price:17498, salePrice:null, stock:14, featured:false, brand:'faisal-sanitary', cat:'bathroom-fittings', img:'Basin-Mixer61.jpg', desc:'Basin Mixers' },
  { name:'Indus Basin Mixer Code 2001 Faisal Sanitary', sku:'BAMI-029', price:17685, salePrice:15917, stock:21, featured:false, brand:'faisal-sanitary', cat:'bathroom-fittings', img:'Basin-Mixer62.jpg', desc:'Basin Mixers' },
  { name:'Jewel Basin Mixer Code 5201 Faisal Sanitary', sku:'BAMI-030', price:18238, salePrice:null, stock:28, featured:false, brand:'faisal-sanitary', cat:'bathroom-fittings', img:'Basin-Mixer64.jpg', desc:'Basin Mixers' },
  { name:'Diamond Basin Mixer Code 6101 Faisal Sanitary', sku:'BAMI-031', price:18520, salePrice:16668, stock:5, featured:false, brand:'faisal-sanitary', cat:'bathroom-fittings', img:'Basin-Mixer66.jpg', desc:'Basin Mixers' },
  { name:'Supra Basin Mixer Code 2101 Faisal Sanitary', sku:'BAMI-032', price:18980, salePrice:null, stock:12, featured:false, brand:'faisal-sanitary', cat:'bathroom-fittings', img:'Basin-Mixer67.jpg', desc:'Basin Mixers' },
  { name:'Royal Basin Mixer Code 4101 Faisal Sanitary', sku:'BAMI-033', price:19581, salePrice:17623, stock:19, featured:false, brand:'faisal-sanitary', cat:'bathroom-fittings', img:'Basin-Mixer70.jpg', desc:'Basin Mixers' },
  { name:'Galaxy Basin Mixer Code 5301 Faisal Sanitary', sku:'BAMI-034', price:20263, salePrice:null, stock:26, featured:false, brand:'faisal-sanitary', cat:'bathroom-fittings', img:'Basin-Mixer72.jpg', desc:'Basin Mixers' },
  { name:'Venus Basin Mixer Code 2801 Faisal Sanitary', sku:'BAMI-035', price:22328, salePrice:20095, stock:33, featured:false, brand:'faisal-sanitary', cat:'bathroom-fittings', img:'Basin-Mixer79.jpg', desc:'Basin Mixers' },
  { name:'Kia Basin Mixer Code 7401 Faisal Sanitary', sku:'BAMI-036', price:22820, salePrice:null, stock:10, featured:false, brand:'faisal-sanitary', cat:'bathroom-fittings', img:'Basin-Mixer80.jpg', desc:'Basin Mixers' },
  // ── Sink Mixers ──────────────────────────────────────────────────
  { name:'Sink Mixer Matte Code 0088', sku:'SINK-037', price:7360, salePrice:6624, stock:17, featured:false, brand:'imported', cat:'kitchen-sinks', img:'0123.jpg', desc:'Sink Mixer' },
  { name:'Chrome Kitchen Sink Mixer Code 022', sku:'SINK-038', price:9660, salePrice:null, stock:24, featured:false, brand:'imported', cat:'kitchen-sinks', img:'Chrome_Pullout_Kitchen_Mixer.jpg', desc:'Sink Mixer' },
  { name:'Sink Mixer Chrome Wall Mounted Code 0079', sku:'SINK-039', price:9660, salePrice:8694, stock:31, featured:false, brand:'imported', cat:'kitchen-sinks', img:'0127.jpg', desc:'Sink Mixer' },
  { name:'Sink Mixer Black Chorus Code 0021', sku:'SINK-040', price:10350, salePrice:null, stock:8, featured:false, brand:'imported', cat:'kitchen-sinks', img:'019.jpg', desc:'Sink Mixer' },
  { name:'Bay Neck Sink Mixer', sku:'SINK-041', price:10350, salePrice:9315, stock:15, featured:false, brand:'imported', cat:'kitchen-sinks', img:'0137.jpg', desc:'Sink Mixer' },
  { name:'Victorian Kitchen Sink Mixer Wall Mounted Code 700 Faisal Sanitary Fittings', sku:'SINK-042', price:15587, salePrice:null, stock:22, featured:false, brand:'faisal-sanitary', cat:'kitchen-sinks', img:'Victorian.jpg', desc:'Sink Mixer' },
  { name:'Margalla Kitchen Sink Mixer Wall Mounted Code 1300 Faisal Sanitary Fittings', sku:'SINK-043', price:17968, salePrice:16171, stock:29, featured:false, brand:'faisal-sanitary', cat:'kitchen-sinks', img:'Margalla.jpg', desc:'Sink Mixer' },
  { name:'Wall Mounted Sink Mixer With HU Type Medium Neck - 018 Master', sku:'SINK-044', price:19509, salePrice:null, stock:6, featured:false, brand:'master-sanitary', cat:'kitchen-sinks', img:'Wall-Mounted-Sink-Mixer-With-HU-Type-Medium-Neck-018-master-sanitary-fittings.jpg', desc:'Sink Mixer' },
  { name:'019 Wall Mounted Sink mixer with HU type Large Neck Master', sku:'SINK-045', price:20141, salePrice:18127, stock:13, featured:false, brand:'master-sanitary', cat:'kitchen-sinks', img:'019-Wall-Mounted-Sink-mixer-with-HU-type-Large-Neck-master-sanitary-fittings.jpg', desc:'Sink Mixer' },
  { name:'Galaxy Kitchen Sink Mixer Wall Mounted Code 800 Faisal Sanitary Fittings', sku:'SINK-046', price:22604, salePrice:null, stock:20, featured:false, brand:'faisal-sanitary', cat:'kitchen-sinks', img:'Galaxy.jpg', desc:'Sink Mixer' },
  { name:'Bolan Kitchen Sink Mixer Wall Mounted Code 1100 Faisal Sanitary Fittings', sku:'SINK-047', price:23598, salePrice:21238, stock:27, featured:false, brand:'faisal-sanitary', cat:'kitchen-sinks', img:'Bolan.jpg', desc:'Sink Mixer' },
  { name:'Jewel Kitchen Sink Mixer Wall Mounted Code 900 Faisal Sanitary Fittings', sku:'SINK-048', price:24302, salePrice:null, stock:34, featured:false, brand:'faisal-sanitary', cat:'kitchen-sinks', img:'Jewel.jpg', desc:'Sink Mixer' },
  { name:'020 Wall Mounted Sink Mixer With Cast Neck Master', sku:'SINK-049', price:26671, salePrice:24004, stock:11, featured:false, brand:'master-sanitary', cat:'kitchen-sinks', img:'020-Wall-Mounted-Cast-Neck-sink-mixer-master-sanitary-fittings.jpg', desc:'Sink Mixer' },
  { name:'Gemini Bowl Sink Mixer Code 1800 Faisal Sanitary Fittings', sku:'SINK-050', price:27759, salePrice:null, stock:18, featured:false, brand:'faisal-sanitary', cat:'kitchen-sinks', img:'Gemini.jpg', desc:'Sink Mixer' },
  { name:'Long Neck Kitchen Sink Mixer Wall Mounted Code 1900 Faisal Sanitary Fittings', sku:'SINK-051', price:29290, salePrice:26361, stock:25, featured:false, brand:'faisal-sanitary', cat:'kitchen-sinks', img:'Single-Lever.jpg', desc:'Sink Mixer' },
  { name:'Indus Single Lever Kitchen Sink Mixer Wall Mounted Code 1700 Faisal Sanitary Fittings', sku:'SINK-052', price:29539, salePrice:null, stock:32, featured:false, brand:'faisal-sanitary', cat:'kitchen-sinks', img:'Indus.jpg', desc:'Sink Mixer' },
  { name:'422 Classy Single Lever Sink Mixer Master', sku:'SINK-053', price:32699, salePrice:29429, stock:9, featured:false, brand:'master-sanitary', cat:'kitchen-sinks', img:'422-Classy-Single-Lever-Sink-Mixer-Master-sanitary-fittings.jpg', desc:'Sink Mixer' },
  { name:'Charisma Sink Mixer HU Type Cast Neck 014 Master', sku:'SINK-054', price:32777, salePrice:null, stock:16, featured:false, brand:'master-sanitary', cat:'kitchen-sinks', img:'Charisma_Sink_Mixer_HU_Type_Cast_Neck_014_Master.jpg', desc:'Sink Mixer' },
  // ── Hand Shower ──────────────────────────────────────────────────
  { name:'Artic Black Hand Shower With Chain Faco', sku:'HAND-055', price:5619, salePrice:5057, stock:23, featured:false, brand:'faco', cat:'bathroom-fittings', img:'Artic_Hand_Shower_With_Chain_Faco.jpg', desc:'Hand Shower' },
  { name:'Spring Hand Shower With Chain Faco', sku:'HAND-056', price:9481, salePrice:null, stock:30, featured:false, brand:'faco', cat:'bathroom-fittings', img:'Spring_Hand_Shower_With_Chain_Faco.jpg', desc:'Hand Shower' },
  { name:'Gloria Hand Shower With Hose Faco', sku:'HAND-057', price:9872, salePrice:8885, stock:7, featured:false, brand:'faco', cat:'bathroom-fittings', img:'Gloria_Hand_Shower_With_Hose_Faco.jpg', desc:'Hand Shower' },
  // ── Muslim Shower ─────────────────────────────────────────────────
  { name:'Toilet Shower With Chain High Pressure Code 805', sku:'MUSL-058', price:3678, salePrice:null, stock:14, featured:false, brand:'imported', cat:'bathroom-fittings', img:'Toilet_Shower_price.jpeg', desc:'Muslim Shower' },
  { name:'Toilet Shower Matt SS Stainless Steel With Chain Pipe code 972', sku:'MUSL-059', price:4598, salePrice:4138, stock:21, featured:false, brand:'imported', cat:'bathroom-fittings', img:'Toilet_Shower_Matt_SS_-_Stainless_steel_With_Chain_Pipe_code_972.jpg', desc:'Muslim Shower' },
  { name:'Black Muslim Shower Smart Faco Toilet Shower With Chain', sku:'MUSL-060', price:4713, salePrice:null, stock:28, featured:false, brand:'faco', cat:'bathroom-fittings', img:'Black_Muslim_Shower_Smart_Faco_Toilet_Shower_With_Chain.jpg', desc:'Muslim Shower' },
  { name:'Matt Black SS Muslim Toilet Shower Code 830', sku:'MUSL-061', price:5173, salePrice:4656, stock:5, featured:false, brand:'imported', cat:'bathroom-fittings', img:'1323.png', desc:'Muslim Shower' },
  { name:'Muslim Shower In White Color with Pipe Code 4204 Faisal Sanitary Fittings', sku:'MUSL-062', price:5249, salePrice:null, stock:12, featured:false, brand:'faisal-sanitary', cat:'bathroom-fittings', img:'Muslim-Shower41.jpg', desc:'Muslim Shower' },
  { name:'Echo Muslim Shower Faco Toilet Shower With Chain', sku:'MUSL-063', price:5403, salePrice:4863, stock:19, featured:false, brand:'faco', cat:'bathroom-fittings', img:'Echo_Muslim_Shower_Faco_Toilet_Shower_With_Chain.jpg', desc:'Muslim Shower' },
  { name:'Bold Muslim Shower Faco Toilet Shower With Chain', sku:'MUSL-064', price:5865, salePrice:null, stock:26, featured:false, brand:'faco', cat:'bathroom-fittings', img:'Bold_Muslim_Shower_Faco_Toilet_Shower_With_Chain.jpg', desc:'Muslim Shower' },
  { name:'Aqua Muslim Shower Faco Toilet Shower With Chain', sku:'MUSL-065', price:6553, salePrice:5898, stock:33, featured:false, brand:'faco', cat:'bathroom-fittings', img:'Aqua_Muslim_Shower_Price_Faco.jpg', desc:'Muslim Shower' },
  { name:'Chrome Brass Muslim Shower with Chain Code 833', sku:'MUSL-066', price:6895, salePrice:null, stock:10, featured:false, brand:'imported', cat:'bathroom-fittings', img:'Chrome_Brass_Muslim_Shower_with_Chain_Code_833.jpg', desc:'Muslim Shower' },
  { name:'Toilet Shower Raya Complete Made in UAE', sku:'MUSL-067', price:6895, salePrice:6206, stock:17, featured:false, brand:'imported', cat:'bathroom-fittings', img:'Toilet_Shower_raya_muslim_shower_raya.jpeg', desc:'Muslim Shower' },
  { name:'Muslim Shower Code 2015 Master Sanitary Fittings', sku:'MUSL-068', price:7008, salePrice:null, stock:24, featured:false, brand:'master-sanitary', cat:'bathroom-fittings', img:'muslim-shower36.jpg', desc:'Muslim Shower' },
  { name:'Eros Muslim Shower Faco Toilet Shower With Chain', sku:'MUSL-069', price:7013, salePrice:6312, stock:31, featured:false, brand:'faco', cat:'bathroom-fittings', img:'Eros_Muslim_Shower_Faco_Toilet_Shower_With_Chain.jpg', desc:'Muslim Shower' },
  { name:'Vigo Toilet Shower Faco Muslim Shower With Chain', sku:'MUSL-070', price:7243, salePrice:null, stock:8, featured:false, brand:'faco', cat:'bathroom-fittings', img:'Vigo_Muslim_Shower_Faco_Toilet_Shower_With_Chain.jpg', desc:'Muslim Shower' },
  { name:'Brushed Gold Bidet Toilet Shower with Chain Code 829', sku:'MUSL-071', price:8045, salePrice:7241, stock:15, featured:false, brand:'imported', cat:'bathroom-fittings', img:'1414.png', desc:'Muslim Shower' },
  { name:'Muslim Shower Brass Gold Plated Code 831', sku:'MUSL-072', price:8045, salePrice:null, stock:22, featured:false, brand:'imported', cat:'bathroom-fittings', img:'Muslim_Shower_Brass_Gold_Plated_Code_831.jpg', desc:'Muslim Shower' },
  { name:'Muslim Shower Matt Black Brass Code 832', sku:'MUSL-073', price:8045, salePrice:7241, stock:29, featured:false, brand:'imported', cat:'bathroom-fittings', img:'1613.png', desc:'Muslim Shower' },
  // ── Basins Pedestal ───────────────────────────────────────────────
  { name:'Wash Basin Pedestal Panama Total Sanitary Ware', sku:'BASI-074', price:9389, salePrice:null, stock:6, featured:false, brand:'total-sanitary', cat:'sanitary-ware', img:'PANAMA.jpg', desc:'Basins Pedestal' },
  { name:'Wash Basin Pedestal Panama Small Total Sanitary Ware', sku:'BASI-075', price:9389, salePrice:8450, stock:13, featured:false, brand:'total-sanitary', cat:'sanitary-ware', img:'PANAMA-SMALL.jpg', desc:'Basins Pedestal' },
  { name:'12X15 Two Piece Wash Basin Brite Sanitary Ware', sku:'BASI-076', price:9637, salePrice:null, stock:20, featured:false, brand:'brite-sanitary', cat:'sanitary-ware', img:'12X15-two-piece-wash-basin-brite-sanitary-ware.jpg', desc:'Basins Pedestal' },
  { name:'12X15 Basin Pedestal Pool Sanitary Ware', sku:'BASI-077', price:10046, salePrice:9041, stock:27, featured:false, brand:'pool-sanitary', cat:'sanitary-ware', img:'12X15-basin-pedestal.jpg', desc:'Basins Pedestal' },
  { name:'12 X 15 Basin Pedestal Dell Sanitary Ware', sku:'BASI-078', price:10764, salePrice:null, stock:34, featured:false, brand:'dell-sanitary', cat:'sanitary-ware', img:'12-X-15-basin-pedestal-dell-sanitary-ware.jpg', desc:'Basins Pedestal' },
  { name:'Wash Basin Pedestal Super Total Sanitary Ware', sku:'BASI-079', price:11286, salePrice:10157, stock:11, featured:false, brand:'total-sanitary', cat:'sanitary-ware', img:'SUPER2.jpg', desc:'Basins Pedestal' },
  { name:'Wash Basin Pedestal Jazeera Total Sanitary Ware', sku:'BASI-080', price:11309, salePrice:null, stock:18, featured:false, brand:'total-sanitary', cat:'sanitary-ware', img:'JAZEERA.jpg', desc:'Basins Pedestal' },
  { name:'Sawati Basin Pedestal Pool Sanitary Ware', sku:'BASI-081', price:11615, salePrice:10454, stock:25, featured:false, brand:'pool-sanitary', cat:'sanitary-ware', img:'Sawati-basin-pedestal.jpg', desc:'Basins Pedestal' },
  { name:'Corner 2 in 1 Basin Pedestal Pool Sanitary Ware', sku:'BASI-082', price:11615, salePrice:null, stock:32, featured:false, brand:'pool-sanitary', cat:'sanitary-ware', img:'2-in-1-basin-pedestal.jpg', desc:'Basins Pedestal' },
  { name:'Wash Basin Pedestal Emsa Sanitary Ware', sku:'BASI-083', price:12303, salePrice:11073, stock:9, featured:false, brand:'total-sanitary', cat:'sanitary-ware', img:'EMSA1.jpg', desc:'Basins Pedestal' },
  { name:'Super Basin Pedestal Pool Sanitary Ware', sku:'BASI-084', price:12419, salePrice:null, stock:16, featured:false, brand:'pool-sanitary', cat:'sanitary-ware', img:'Super-basin-pedestal.jpg', desc:'Basins Pedestal' },
  { name:'14 X 20 Basin Pedestal Dell Sanitary Ware', sku:'BASI-085', price:13598, salePrice:12238, stock:23, featured:false, brand:'dell-sanitary', cat:'sanitary-ware', img:'14-X-20-basin-pedestal-dell-sanitary-ware.jpg', desc:'Basins Pedestal' },
  { name:'Juno Basin Pedestal Pool Sanitary Ware', sku:'BASI-086', price:14260, salePrice:null, stock:30, featured:false, brand:'pool-sanitary', cat:'sanitary-ware', img:'Juno-basin-pedestal.jpg', desc:'Basins Pedestal' },
  { name:'Wash Basin Pedestal Bravo Total Sanitary Ware', sku:'BASI-087', price:14489, salePrice:13040, stock:7, featured:false, brand:'total-sanitary', cat:'sanitary-ware', img:'BRAVO1.jpg', desc:'Basins Pedestal' },
  { name:'15 X 19 Basin Pedestal Dell Sanitary Ware', sku:'BASI-088', price:14490, salePrice:null, stock:14, featured:false, brand:'dell-sanitary', cat:'sanitary-ware', img:'15-X-19-basin-pedestal-dell-sanitary-ware.jpg', desc:'Basins Pedestal' },
  { name:'IRIS 15 X 19 Basin Pedestal Pool Sanitary Ware', sku:'BASI-089', price:15039, salePrice:13535, stock:21, featured:false, brand:'pool-sanitary', cat:'sanitary-ware', img:'IRIS-basin-pedestal.jpg', desc:'Basins Pedestal' },
  { name:'Wash Basin Pedestal Mira Total Sanitary Ware', sku:'BASI-090', price:15917, salePrice:null, stock:28, featured:false, brand:'total-sanitary', cat:'sanitary-ware', img:'MIRA.jpg', desc:'Basins Pedestal' },
  // ── Vanity Bowl ───────────────────────────────────────────────────
  { name:'Vanity Bowl Basin code 5001', sku:'VANI-091', price:34500, salePrice:31050, stock:5, featured:false, brand:'imported', cat:'sanitary-ware', img:'art_bowl_001.jpg', desc:'Vanity Bowl' },
  { name:'Vanity Bowl Sink code 5002', sku:'VANI-092', price:34500, salePrice:null, stock:12, featured:false, brand:'imported', cat:'sanitary-ware', img:'art_bowl_002.jpg', desc:'Vanity Bowl' },
  { name:'Vanity Bowl Basin code 5003', sku:'VANI-093', price:34500, salePrice:31050, stock:19, featured:false, brand:'imported', cat:'sanitary-ware', img:'art_bowl_003.jpg', desc:'Vanity Bowl' },
  { name:'Vanity Bowl Basin code 5005', sku:'VANI-094', price:34500, salePrice:null, stock:26, featured:false, brand:'imported', cat:'sanitary-ware', img:'art_bowl_005_(2).jpg', desc:'Vanity Bowl' },
  { name:'Vanity Bowl Basin code 5006', sku:'VANI-095', price:34500, salePrice:31050, stock:33, featured:false, brand:'imported', cat:'sanitary-ware', img:'art_bowl_005.jpg', desc:'Vanity Bowl' },
  { name:'Vanity Bowl Basin code 5007', sku:'VANI-096', price:34500, salePrice:null, stock:10, featured:false, brand:'imported', cat:'sanitary-ware', img:'art_bowl_007_(2).jpg', desc:'Vanity Bowl' },
  { name:'Vanity Bowl Basin code 5008', sku:'VANI-097', price:34500, salePrice:31050, stock:17, featured:false, brand:'imported', cat:'sanitary-ware', img:'art_bowl_008_(2).jpg', desc:'Vanity Bowl' },
  { name:'Vanity Bowl Basin code 5009', sku:'VANI-098', price:34500, salePrice:null, stock:24, featured:false, brand:'imported', cat:'sanitary-ware', img:'art_bowl_009_(2).jpg', desc:'Vanity Bowl' },
  { name:'Vanity Bowl Basin code 5010', sku:'VANI-099', price:34500, salePrice:31050, stock:31, featured:false, brand:'imported', cat:'sanitary-ware', img:'art_bowl_010_(2).jpg', desc:'Vanity Bowl' },
  { name:'Vanity Bowl Basin code 5011', sku:'VANI-100', price:34500, salePrice:null, stock:8, featured:false, brand:'imported', cat:'sanitary-ware', img:'art_bowl_011_(2).jpg', desc:'Vanity Bowl' },
  { name:'Vanity Bowl Basin code 5012', sku:'VANI-101', price:34500, salePrice:31050, stock:15, featured:false, brand:'imported', cat:'sanitary-ware', img:'art_bowl_012_(2).jpg', desc:'Vanity Bowl' },
  { name:'Vanity Bowl Basin code 5013', sku:'VANI-102', price:34500, salePrice:null, stock:22, featured:false, brand:'imported', cat:'sanitary-ware', img:'art_bowl_013_(2).jpg', desc:'Vanity Bowl' },
  { name:'Vanity Bowl Basin code 5014', sku:'VANI-103', price:34500, salePrice:31050, stock:29, featured:false, brand:'imported', cat:'sanitary-ware', img:'art_bowl_014_(2).jpg', desc:'Vanity Bowl' },
  { name:'Vanity Bowl Basin code 5015', sku:'VANI-104', price:34500, salePrice:null, stock:6, featured:false, brand:'imported', cat:'sanitary-ware', img:'art_bowl_015_(2).jpg', desc:'Vanity Bowl' },
  { name:'Vanity Bowl Basin code 5016', sku:'VANI-105', price:36800, salePrice:33120, stock:13, featured:false, brand:'imported', cat:'sanitary-ware', img:'art_bowl_016_(2).jpg', desc:'Vanity Bowl' },
  { name:'Vanity Bowl Basin code 5017', sku:'VANI-106', price:36800, salePrice:null, stock:20, featured:false, brand:'imported', cat:'sanitary-ware', img:'art_bowl_017_(2).jpg', desc:'Vanity Bowl' },
  { name:'Vanity Bowl Basin code 5018', sku:'VANI-107', price:36800, salePrice:33120, stock:27, featured:false, brand:'imported', cat:'sanitary-ware', img:'art_bowl_018_(2).jpg', desc:'Vanity Bowl' },
  { name:'Vanity Bowl Basin code 5019', sku:'VANI-108', price:36800, salePrice:null, stock:34, featured:false, brand:'imported', cat:'sanitary-ware', img:'art_bowl_019_(2).jpg', desc:'Vanity Bowl' },
  // ── One Piece Toilet ──────────────────────────────────────────────
  { name:'GALAXY Commode Pool Sanitary Ware', sku:'ONEP-109', price:35862, salePrice:32276, stock:11, featured:false, brand:'pool-sanitary', cat:'sanitary-ware', img:'Galaxy-Commode-Pool-Sanitary-Ware.jpg', desc:'One Piece Toilet' },
  { name:'MOBI Commode Pool Sanitary Ware', sku:'ONEP-110', price:35862, salePrice:null, stock:18, featured:false, brand:'pool-sanitary', cat:'sanitary-ware', img:'Mobi-Commode-Pool-Sanitary-Ware.jpg', desc:'One Piece Toilet' },
  { name:'PORTA CHINA Commode Pool Sanitary Ware', sku:'ONEP-111', price:35862, salePrice:32276, stock:25, featured:false, brand:'pool-sanitary', cat:'sanitary-ware', img:'Porta-China-Commode-Pool-Sanitary-Ware1.jpg', desc:'One Piece Toilet' },
  { name:'One Piece Toilet Mira Total Sanitary Ware', sku:'ONEP-112', price:36568, salePrice:null, stock:32, featured:false, brand:'total-sanitary', cat:'sanitary-ware', img:'MIRA1.jpg', desc:'One Piece Toilet' },
  { name:'Dell 2 Commode Dell Sanitary Ware', sku:'ONEP-113', price:38148, salePrice:34333, stock:9, featured:false, brand:'dell-sanitary', cat:'sanitary-ware', img:'Dell_2_Commode_Dell_Sanitary_Ware2.jpg', desc:'One Piece Toilet' },
  { name:'Belta Commode', sku:'ONEP-114', price:38148, salePrice:null, stock:16, featured:false, brand:'dell-sanitary', cat:'sanitary-ware', img:'belta-commode-dell-sanitary-ware.jpg', desc:'One Piece Toilet' },
  { name:'Glow Commode', sku:'ONEP-115', price:38148, salePrice:34333, stock:23, featured:false, brand:'dell-sanitary', cat:'sanitary-ware', img:'glow-commode-dell-sanitary-ware.jpg', desc:'One Piece Toilet' },
  { name:'One Piece Toilet Bravo Total Sanitary Ware', sku:'ONEP-116', price:38173, salePrice:null, stock:30, featured:false, brand:'total-sanitary', cat:'sanitary-ware', img:'BRAVO2.jpg', desc:'One Piece Toilet' },
  { name:'One Piece Toilet Flora Total Sanitary Ware', sku:'ONEP-117', price:38403, salePrice:34563, stock:7, featured:false, brand:'total-sanitary', cat:'sanitary-ware', img:'FLORA2.jpg', desc:'One Piece Toilet' },
  { name:'Amore Commode Dell Sanitary Ware', sku:'ONEP-118', price:40429, salePrice:null, stock:14, featured:false, brand:'dell-sanitary', cat:'sanitary-ware', img:'amore-commode-dell-sanitary-ware.jpg', desc:'One Piece Toilet' },
  { name:'Charlie Commode Dell Sanitary Ware', sku:'ONEP-119', price:40429, salePrice:36386, stock:21, featured:false, brand:'dell-sanitary', cat:'sanitary-ware', img:'charlie-commode-dell-sanitary-ware.png', desc:'One Piece Toilet' },
  { name:'Galaxy Commode Dell Sanitary Ware', sku:'ONEP-120', price:40429, salePrice:null, stock:28, featured:false, brand:'dell-sanitary', cat:'sanitary-ware', img:'galaxy-commode-dell-sanitary-ware.jpg', desc:'One Piece Toilet' },
  { name:'Dell Plus Commode Dell Sanitary Ware', sku:'ONEP-121', price:41855, salePrice:37670, stock:5, featured:false, brand:'dell-sanitary', cat:'sanitary-ware', img:'Dell_Plus_Commode_Dell_Sanitary_Ware1.jpg', desc:'One Piece Toilet' },
  { name:'One Piece Toilet IFO Total Sanitary Ware', sku:'ONEP-122', price:43470, salePrice:null, stock:12, featured:false, brand:'total-sanitary', cat:'sanitary-ware', img:'IFO2.jpg', desc:'One Piece Toilet' },
  // ── Two Piece Toilets ─────────────────────────────────────────────
  { name:'SUPER 3 Star Ceramics', sku:'TWOP-123', price:18379, salePrice:16541, stock:19, featured:false, brand:'dell-sanitary', cat:'sanitary-ware', img:'SUPER1.jpg', desc:'Two Piece Toilets' },
  { name:'TP 201 3 Star Ceramics', sku:'TWOP-124', price:19414, salePrice:null, stock:26, featured:false, brand:'dell-sanitary', cat:'sanitary-ware', img:'TP-201.jpg', desc:'Two Piece Toilets' },
  { name:'TP 202 3 Star Ceramics', sku:'TWOP-125', price:19414, salePrice:17473, stock:33, featured:false, brand:'dell-sanitary', cat:'sanitary-ware', img:'TP-202.jpg', desc:'Two Piece Toilets' },
  { name:'Two Piece Toilet IFO Total Sanitary Ware', sku:'TWOP-126', price:24877, salePrice:null, stock:10, featured:false, brand:'total-sanitary', cat:'sanitary-ware', img:'IFO1.jpg', desc:'Two Piece Toilets' },
  { name:'Two Piece Toilet Panama Total Sanitary Ware', sku:'TWOP-127', price:25893, salePrice:23304, stock:17, featured:false, brand:'total-sanitary', cat:'sanitary-ware', img:'PANAMA1.jpg', desc:'Two Piece Toilets' },
  { name:'PORTA 2 Commode Pool Sanitary Ware', sku:'TWOP-128', price:27312, salePrice:null, stock:24, featured:false, brand:'pool-sanitary', cat:'sanitary-ware', img:'Porta-2-Commode-Pool-Sanitary-Ware.jpg', desc:'Two Piece Toilets' },
  { name:'UNIQUE Commode Pool Sanitary Ware', sku:'TWOP-129', price:30417, salePrice:27375, stock:31, featured:false, brand:'pool-sanitary', cat:'sanitary-ware', img:'Unique-Commode-Pool-Sanitary-Ware.jpg', desc:'Two Piece Toilets' },
  { name:'Porta One Piece Commode Brite Sanitary Ware', sku:'TWOP-130', price:31462, salePrice:null, stock:8, featured:false, brand:'brite-sanitary', cat:'sanitary-ware', img:'porta-two-piece-commode-brite-sanitary-ware.jpg', desc:'Two Piece Toilets' },
  { name:'IFO Two Piece Commode Brite Sanitary Ware', sku:'TWOP-131', price:32361, salePrice:29125, stock:15, featured:false, brand:'brite-sanitary', cat:'sanitary-ware', img:'ifo-two-piece-commode-brite-sanitary-ware.jpg', desc:'Two Piece Toilets' },
  { name:'Two Piece Toilet Bravo Total Sanitary Ware', sku:'TWOP-132', price:33811, salePrice:null, stock:22, featured:false, brand:'total-sanitary', cat:'sanitary-ware', img:'BRAVO1.jpg', desc:'Two Piece Toilets' },
  { name:'Super Two Piece Commode Brite Sanitary Ware', sku:'TWOP-133', price:36800, salePrice:33120, stock:29, featured:false, brand:'brite-sanitary', cat:'sanitary-ware', img:'super-two-piece-commode-brite-sanitary-ware.jpg', desc:'Two Piece Toilets' },
  { name:'Golf Commode Pool Sanitary Ware', sku:'TWOP-134', price:43700, salePrice:null, stock:6, featured:false, brand:'pool-sanitary', cat:'sanitary-ware', img:'Golf-Commode-Pool-Sanitary-Ware.jpg', desc:'Two Piece Toilets' },
  // ── Single Bowl Kitchen Sink ──────────────────────────────────────
  { name:'50 x 40 Kitchen Sink Handmade', sku:'SING-135', price:24148, salePrice:21733, stock:13, featured:false, brand:'imported', cat:'kitchen-sinks', img:'50_x_40_Kitchen_Sink_Handmade.jpg', desc:'Single Bowl Kitchen Sink' },
  { name:'60 x 45 Kitchen Sink Handmade', sku:'SING-136', price:26448, salePrice:null, stock:20, featured:false, brand:'imported', cat:'kitchen-sinks', img:'60x45-handmade.jpg', desc:'Single Bowl Kitchen Sink' },
  { name:'68 x 45 Kitchen Sink Handmade', sku:'SING-137', price:28748, salePrice:25873, stock:27, featured:false, brand:'imported', cat:'kitchen-sinks', img:'68x45-handmade.jpg', desc:'Single Bowl Kitchen Sink' },
  { name:'75 x 45 Kitchen Sink Handmade', sku:'SING-138', price:31050, salePrice:null, stock:34, featured:false, brand:'imported', cat:'kitchen-sinks', img:'75x45-handmade.jpg', desc:'Single Bowl Kitchen Sink' },
  { name:'82 x 45 Kitchen Sink Handmade Black', sku:'SING-139', price:34500, salePrice:31050, stock:11, featured:false, brand:'imported', cat:'kitchen-sinks', img:'82-x-45-Kitchen-Sink-Handmade-Black.jpg', desc:'Single Bowl Kitchen Sink' },
  // ── Double Bowl Kitchen Sink ──────────────────────────────────────
  { name:'60 x 45 Double Kitchen Sink Handmade', sku:'DOUB-140', price:41400, salePrice:null, stock:18, featured:false, brand:'imported', cat:'kitchen-sinks', img:'60-x-45-Double-Kitchen-Sink-Handmade.jpg', desc:'Double Bowl Kitchen Sink' },
  { name:'75 x 45 Double Kitchen Sink Handmade', sku:'DOUB-141', price:43700, salePrice:39330, stock:25, featured:false, brand:'imported', cat:'kitchen-sinks', img:'75-x-45-double-kitchen-sink-handmade.jpg', desc:'Double Bowl Kitchen Sink' },
  { name:'82 x 45 Double Kitchen Sink Handmade', sku:'DOUB-142', price:48300, salePrice:null, stock:32, featured:false, brand:'imported', cat:'kitchen-sinks', img:'82-x-45-Double-Kitchen-Sink-Handmade.jpg', desc:'Double Bowl Kitchen Sink' },
  { name:'82 x 45 Golden Double Kitchen Sink Handmade', sku:'DOUB-143', price:60950, salePrice:54855, stock:9, featured:false, brand:'imported', cat:'kitchen-sinks', img:'82-x-45-Golden-Double-Kitchen-Sink-Handmade-1.jpg', desc:'Double Bowl Kitchen Sink' },
  { name:'82 x 45 Black Double Kitchen Sink Handmade', sku:'DOUB-144', price:60950, salePrice:null, stock:16, featured:false, brand:'imported', cat:'kitchen-sinks', img:'82_x_45_Black_Double_Kitchen_Sink_Handmade_1.jpg', desc:'Double Bowl Kitchen Sink' },
  { name:'75x46 Black Handmade Luxury Kitchen Sink', sku:'DOUB-145', price:69000, salePrice:62100, stock:23, featured:false, brand:'imported', cat:'kitchen-sinks', img:'75X46-black-handmade-kitchen-sink.jpg', desc:'Double Bowl Kitchen Sink' },
  // ── Aluminum Bathroom Vanities ────────────────────────────────────
  { name:'Bathroom Vanity - Ak51 Aluminum', sku:'ALUM-146', price:103500, salePrice:null, stock:5, featured:false, brand:'imported', cat:'bathroom', img:'Ak51.jpg', desc:'Aluminum Bathroom Vanities' },
  { name:'Bathroom Vanity - Ak52 Aluminum', sku:'ALUM-147', price:103500, salePrice:93150, stock:12, featured:false, brand:'imported', cat:'bathroom', img:'Ak52.jpg', desc:'Aluminum Bathroom Vanities' },
  { name:'Bathroom Vanity - Ak53 Aluminum', sku:'ALUM-148', price:108100, salePrice:null, stock:19, featured:false, brand:'imported', cat:'bathroom', img:'Ak53.jpg', desc:'Aluminum Bathroom Vanities' },
  { name:'Bathroom Vanity - 2120 Aluminum', sku:'ALUM-149', price:110400, salePrice:99360, stock:26, featured:false, brand:'imported', cat:'bathroom', img:'2120.jpg', desc:'Aluminum Bathroom Vanities' },
  { name:'Bathroom Vanity - 3039 Aluminum', sku:'ALUM-150', price:112700, salePrice:null, stock:33, featured:false, brand:'imported', cat:'bathroom', img:'3039.jpg', desc:'Aluminum Bathroom Vanities' },
  { name:'Bathroom Vanity - 3040 Aluminum', sku:'ALUM-151', price:112700, salePrice:101430, stock:10, featured:false, brand:'imported', cat:'bathroom', img:'3040.jpg', desc:'Aluminum Bathroom Vanities' },
  { name:'Bathroom Vanity - Ak55 Aluminum', sku:'ALUM-152', price:115000, salePrice:null, stock:17, featured:false, brand:'imported', cat:'bathroom', img:'22.jpg', desc:'Aluminum Bathroom Vanities' },
  { name:'Bathroom Vanity - 3042 Aluminum', sku:'ALUM-153', price:115000, salePrice:103500, stock:24, featured:false, brand:'imported', cat:'bathroom', img:'4611.jpg', desc:'Aluminum Bathroom Vanities' },
  { name:'Bathroom Vanity - VF019 Aluminum', sku:'ALUM-154', price:117300, salePrice:null, stock:31, featured:false, brand:'imported', cat:'bathroom', img:'VF019.jpg', desc:'Aluminum Bathroom Vanities' },
  { name:'Bathroom Vanity - 2145 Aluminum', sku:'ALUM-155', price:118450, salePrice:106605, stock:8, featured:false, brand:'imported', cat:'bathroom', img:'2145.jpg', desc:'Aluminum Bathroom Vanities' },
  { name:'Bathroom Vanity - 2126 Aluminum', sku:'ALUM-156', price:119600, salePrice:null, stock:15, featured:false, brand:'imported', cat:'bathroom', img:'2126.jpg', desc:'Aluminum Bathroom Vanities' },
  { name:'Bathroom Vanity - 2134 Aluminum', sku:'ALUM-157', price:119600, salePrice:107640, stock:22, featured:false, brand:'imported', cat:'bathroom', img:'2134.jpg', desc:'Aluminum Bathroom Vanities' },
  { name:'Bathroom Vanity - A011 Aluminum', sku:'ALUM-158', price:119600, salePrice:null, stock:29, featured:false, brand:'imported', cat:'bathroom', img:'A011.jpg', desc:'Aluminum Bathroom Vanities' },
  { name:'Bathroom Vanity - A002 Aluminum', sku:'ALUM-159', price:121900, salePrice:109710, stock:6, featured:false, brand:'imported', cat:'bathroom', img:'A002.jpg', desc:'Aluminum Bathroom Vanities' },
  { name:'Bathroom Vanity - A015 Aluminum', sku:'ALUM-160', price:121900, salePrice:null, stock:13, featured:false, brand:'imported', cat:'bathroom', img:'A015.jpg', desc:'Aluminum Bathroom Vanities' },
  { name:'Bathroom Vanity - 2183 Aluminum', sku:'ALUM-161', price:124200, salePrice:111780, stock:20, featured:false, brand:'imported', cat:'bathroom', img:'2183.jpg', desc:'Aluminum Bathroom Vanities' },
  { name:'Bathroom Vanity - A044 Aluminum', sku:'ALUM-162', price:124200, salePrice:null, stock:27, featured:false, brand:'imported', cat:'bathroom', img:'A044.jpg', desc:'Aluminum Bathroom Vanities' },
  { name:'Bathroom Vanity - AK16 Aluminum', sku:'ALUM-163', price:126500, salePrice:113850, stock:34, featured:false, brand:'imported', cat:'bathroom', img:'AK16.jpg', desc:'Aluminum Bathroom Vanities' },
  // ── Corner Bath Tubs ──────────────────────────────────────────────
  { name:'103 Civic Corner Luna Sanitary Fittings', sku:'CORN-164', price:55195, salePrice:null, stock:11, featured:false, brand:'luna-sanitary', cat:'bathroom', img:'103-Civic-Corner-Luna-Sanitary-Fittings.jpg', desc:'Corner Bath Tubs' },
  { name:'106 Weatherby Luna Sanitary Fittings', sku:'CORN-165', price:61329, salePrice:55196, stock:18, featured:false, brand:'luna-sanitary', cat:'bathroom', img:'106-Weatherby-Luna-Sanitary-Fittings.jpg', desc:'Corner Bath Tubs' },
  { name:'107 Banksia Luna Sanitary Fittings', sku:'CORN-166', price:61329, salePrice:null, stock:25, featured:false, brand:'luna-sanitary', cat:'bathroom', img:'107-Banksia-Luna-Sanitary-Fittings.jpg', desc:'Corner Bath Tubs' },
  { name:'104 Civic Corner with Panel Luna Sanitary Fittings', sku:'CORN-167', price:76664, salePrice:68998, stock:32, featured:false, brand:'luna-sanitary', cat:'bathroom', img:'104-Civic-Corner-with-panel-Luna-Sanitary-Fittings.jpg', desc:'Corner Bath Tubs' },
  { name:'101 Niagara Corner Luna Sanitary Fittings', sku:'CORN-168', price:91995, salePrice:null, stock:9, featured:false, brand:'luna-sanitary', cat:'bathroom', img:'101-Niagra-Corner-Luna-Sanitary-Fittings.jpg', desc:'Corner Bath Tubs' },
  { name:'102 York Corner Luna Sanitary Fittings', sku:'CORN-169', price:91995, salePrice:82796, stock:16, featured:false, brand:'luna-sanitary', cat:'bathroom', img:'102-York-Corner-Luna-Sanitary-Fittings.jpg', desc:'Corner Bath Tubs' },
  // ── Standard Baths ────────────────────────────────────────────────
  { name:'119 Jazz Shower Tray Luna Sanitary Fittings', sku:'STAN-170', price:34500, salePrice:null, stock:23, featured:false, brand:'luna-sanitary', cat:'bathroom', img:'119-Jazz-Shower-Tray-Luna-Sanitary-Fittings.jpg', desc:'Standard Baths' },
  { name:'108 Carina Baby Tub Luna Sanitary Fittings', sku:'STAN-171', price:45995, salePrice:41396, stock:30, featured:false, brand:'luna-sanitary', cat:'bathroom', img:'108-Carina-Baby-Tub-Luna-Sanitary-Fittings.jpg', desc:'Standard Baths' },
  { name:'109 Sunny Luna Sanitary Fittings', sku:'STAN-172', price:45995, salePrice:null, stock:7, featured:false, brand:'luna-sanitary', cat:'bathroom', img:'109-Sunny-Luna-Sanitary-Fittings.jpg', desc:'Standard Baths' },
  { name:'115 Magnum Luna Sanitary Fittings', sku:'STAN-173', price:45995, salePrice:41396, stock:14, featured:false, brand:'luna-sanitary', cat:'bathroom', img:'115-Magnum-Luna-Sanitary-Fittings.jpg', desc:'Standard Baths' },
  { name:'118 Kira Shower Tray Luna Sanitary Fittings', sku:'STAN-174', price:45995, salePrice:null, stock:21, featured:false, brand:'luna-sanitary', cat:'bathroom', img:'118-Kira-Shower-Tray-Luna-Sanitary-Fittings.jpg', desc:'Standard Baths' },
  { name:'110 Luna Delux Luna Sanitary Fittings', sku:'STAN-175', price:47145, salePrice:42431, stock:28, featured:false, brand:'luna-sanitary', cat:'bathroom', img:'110-Luna-Delux-Luna-Sanitary-Fittings.jpg', desc:'Standard Baths' },
  { name:'Bath Tub 117 Luna Sanitary Fittings', sku:'STAN-176', price:48295, salePrice:null, stock:5, featured:false, brand:'luna-sanitary', cat:'bathroom', img:'117-Luna-Sanitary-Fittings.jpg', desc:'Standard Baths' },
  { name:'111 Capri Luna Sanitary Fittings', sku:'STAN-177', price:48295, salePrice:43466, stock:12, featured:false, brand:'luna-sanitary', cat:'bathroom', img:'111-Capri-Luna-Sanitary-Fittings.jpg', desc:'Standard Baths' },
  { name:'112 Seville Luna Sanitary Fittings', sku:'STAN-178', price:48295, salePrice:null, stock:19, featured:false, brand:'luna-sanitary', cat:'bathroom', img:'112-Seville-Luna-Sanitary-Fittings.jpg', desc:'Standard Baths' },
  { name:'113 Glamour Crown Luna Sanitary Fittings', sku:'STAN-179', price:55195, salePrice:49676, stock:26, featured:false, brand:'luna-sanitary', cat:'bathroom', img:'113-Glamour-Crown-Luna-Sanitary-Fittings.jpg', desc:'Standard Baths' },
  { name:'114 Borgan Luna Sanitary Fittings', sku:'STAN-180', price:55195, salePrice:null, stock:33, featured:false, brand:'luna-sanitary', cat:'bathroom', img:'114-Borgan-Luna-Sanitary-Fittings.jpg', desc:'Standard Baths' },
  { name:'116 Oval Luna Sanitary Fittings', sku:'STAN-181', price:91995, salePrice:82796, stock:10, featured:false, brand:'luna-sanitary', cat:'bathroom', img:'116-Oval-Luna-Sanitary-Fittings.jpg', desc:'Standard Baths' },
  // ── LED Mirrors ───────────────────────────────────────────────────
  { name:'LED Mirror Rectangle Shape 24x32 code 5000', sku:'LEDM-182', price:13800, salePrice:null, stock:17, featured:false, brand:'imported', cat:'bathroom', img:'mirror-placeholder.jpg', desc:'LED Mirrors' },
  { name:'LED Mirror Round Shape 24x24 code 5001', sku:'LEDM-183', price:19320, salePrice:17388, stock:24, featured:false, brand:'imported', cat:'bathroom', img:'mirror-placeholder.jpg', desc:'LED Mirrors' },
  { name:'LED Mirror Round Shape 24x24 code 5002', sku:'LEDM-184', price:13800, salePrice:null, stock:31, featured:false, brand:'imported', cat:'bathroom', img:'mirror-placeholder.jpg', desc:'LED Mirrors' },
  { name:'LED Mirror Rectangle Shape 24x32 code 5003', sku:'LEDM-185', price:13800, salePrice:12420, stock:8, featured:false, brand:'imported', cat:'bathroom', img:'mirror-placeholder.jpg', desc:'LED Mirrors' },
  { name:'LED Mirror Rectangle Shape 24x32 code 5004', sku:'LEDM-186', price:13800, salePrice:null, stock:15, featured:false, brand:'imported', cat:'bathroom', img:'mirror-placeholder.jpg', desc:'LED Mirrors' },
  { name:'LED Mirror Rectangle Shape 24x32 code 5005', sku:'LEDM-187', price:13800, salePrice:12420, stock:22, featured:false, brand:'imported', cat:'bathroom', img:'mirror-placeholder.jpg', desc:'LED Mirrors' },
  { name:'LED Mirror Rectangle Shape 24x32 code 5006', sku:'LEDM-188', price:13800, salePrice:null, stock:29, featured:false, brand:'imported', cat:'bathroom', img:'mirror-placeholder.jpg', desc:'LED Mirrors' },
  { name:'LED Mirror Rectangle Shape 24x32 code 5007', sku:'LEDM-189', price:13800, salePrice:12420, stock:6, featured:false, brand:'imported', cat:'bathroom', img:'mirror-placeholder.jpg', desc:'LED Mirrors' },
  { name:'LED Mirror Round Shape 24x24 code 5008', sku:'LEDM-190', price:13800, salePrice:null, stock:13, featured:false, brand:'imported', cat:'bathroom', img:'mirror-placeholder.jpg', desc:'LED Mirrors' },
  // ── Wall Hung Basin ───────────────────────────────────────────────
  { name:'Grace Wall Hang Basin Pool Sanitary Ware', sku:'WALH-191', price:22289, salePrice:20060, stock:20, featured:false, brand:'pool-sanitary', cat:'sanitary-ware', img:'Grace-Wall-Hang-Basin-Pool-Sanitary-Ware.jpg', desc:'Wall Hung Basin' },
  { name:'Wall Hung Basin 1 Dell Sanitary Ware', sku:'WALH-192', price:26461, salePrice:null, stock:27, featured:false, brand:'dell-sanitary', cat:'sanitary-ware', img:'wall-hang-basin-dell-sanitary-ware.jpg', desc:'Wall Hung Basin' },
  { name:'Wall Hang Basin 3 Dell Sanitary Ware', sku:'WALH-193', price:27956, salePrice:25160, stock:34, featured:false, brand:'dell-sanitary', cat:'sanitary-ware', img:'Wall_Hang_Basin_3_Dell_Sanitary_Ware.jpg', desc:'Wall Hung Basin' },
  { name:'Pool 3 Wall Hang Basin Pool Sanitary Ware', sku:'WALH-194', price:33511, salePrice:null, stock:11, featured:false, brand:'pool-sanitary', cat:'sanitary-ware', img:'Pool-3-Wall-Hang-Basin-Pool-Sanitary-Ware.jpg', desc:'Wall Hung Basin' },
  { name:'WH-B-002 Wall Hung Wash Basin Brite Sanitary Ware', sku:'WALH-195', price:39160, salePrice:35244, stock:18, featured:false, brand:'brite-sanitary', cat:'sanitary-ware', img:'wh-b-002-wall-hung-wash-basin-brite-sanitary-ware.jpg', desc:'Wall Hung Basin' },
  { name:'Wall Hung Basin Pedestal HDLP203AH Porta', sku:'WALH-196', price:39788, salePrice:null, stock:25, featured:false, brand:'porta', cat:'sanitary-ware', img:'HDLP203AH.jpg', desc:'Wall Hung Basin' },
  { name:'WH-B-001 Wall Hung Wash Basin Brite Sanitary Ware', sku:'WALH-197', price:43997, salePrice:39597, stock:32, featured:false, brand:'brite-sanitary', cat:'sanitary-ware', img:'wh-b-001-wall-hung-wash-basin-brite-sanitary-ware.jpg', desc:'Wall Hung Basin' },
  { name:'Wall Hung Basin Pedestal HDLP201AH Porta', sku:'WALH-198', price:59994, salePrice:null, stock:9, featured:false, brand:'porta', cat:'sanitary-ware', img:'HDLP201AH.jpg', desc:'Wall Hung Basin' },
] as const

async function main() {
  // Ensure extra brands exist
  const extraBrands = [
    { name: 'Master Sanitary', slug: 'master-sanitary' },
    { name: 'Sonex Sanitary', slug: 'sonex' },
    { name: 'Faisal Sanitary', slug: 'faisal-sanitary' },
    { name: 'Imported', slug: 'imported' },
    { name: 'Faco', slug: 'faco' },
    { name: 'Total Sanitary Ware', slug: 'total-sanitary' },
    { name: 'Brite Sanitary Ware', slug: 'brite-sanitary' },
    { name: 'Pool Sanitary Ware', slug: 'pool-sanitary' },
    { name: 'Dell Sanitary Ware', slug: 'dell-sanitary' },
    { name: 'Luna Sanitary Fittings', slug: 'luna-sanitary' },
    { name: 'Porta', slug: 'porta' },
  ]
  for (const b of extraBrands) {
    await prisma.brand.upsert({ where: { slug: b.slug }, update: {}, create: b })
  }

  // Ensure kitchen-sinks sub-category exists
  const kitchenCat = await prisma.category.findUnique({ where: { slug: 'kitchen' } })
  if (kitchenCat) {
    await prisma.category.upsert({
      where: { slug: 'kitchen-sinks' },
      update: {},
      create: { name: 'Kitchen Sinks', slug: 'kitchen-sinks', description: 'Handmade and stainless steel kitchen sinks', parentId: kitchenCat.id, order: 1 },
    })
  }

  // Build lookup maps
  const brandMap: Record<string, string> = {}
  const allBrands = await prisma.brand.findMany()
  for (const b of allBrands) brandMap[b.slug] = b.id

  const catMap: Record<string, string> = {}
  const allCats = await prisma.category.findMany()
  for (const c of allCats) catMap[c.slug] = c.id

  let seeded = 0
  for (const p of products) {
    const categoryId = catMap[p.cat]
    if (!categoryId) { console.log('Missing category:', p.cat); continue }
    const brandId = brandMap[p.brand] || null
    const slug = p.sku.toLowerCase() + '-' + p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50)
    try {
      await prisma.product.upsert({
        where: { sku: p.sku },
        update: {},
        create: {
          name: p.name,
          slug,
          sku: p.sku,
          description: `${p.name}. Premium quality ${p.desc.toLowerCase()} available at Matin Sanitary.`,
          shortDesc: p.desc,
          price: p.price,
          ...(p.salePrice ? { salePrice: p.salePrice } : {}),
          stock: p.stock,
          featured: p.featured,
          status: ProductStatus.ACTIVE,
          images: [`${BASE}${p.img}`],
          categoryId,
          ...(brandId ? { brandId } : {}),
        },
      })
      seeded++
    } catch (e: any) { console.log('skip', p.sku, e.message) }
  }

  console.log(`Seeded ${seeded}/${products.length} products`)
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
