// Base de alimentos. Valores por 100 g (o 100 ml en bebidas): kcal | proteína | carbohidratos | grasas.
// Fuentes: Tabla de Composición de Alimentos de Argentina (ARGENFOODS, UNLu) y USDA FoodData Central;
// los platos preparados usan una receta típica argentina. Son valores de referencia: siempre se pueden editar.
// Formato: nombre | categoría | kcal | P | C | G | porciones ("nombre:gramos;…") | alias (separados por coma)
export const RAW = `
Bife de chorizo|carnes|230|26|0|14|1 bife chico:200;1 bife grande:350;100 g:100|carne,bife,churrasco,steak
Bife de costilla|carnes|260|24|0|18|1 bife:250;100 g:100|carne,bife,chuleta
Ojo de bife|carnes|245|25|0|16|1 bife:250;100 g:100|carne,entrecot,ribeye
Lomo|carnes|180|27|0|8|1 medallón:150;1 porción:200;100 g:100|carne,solomillo,filet
Cuadril|carnes|170|28|0|6|1 porción:200;100 g:100|carne,rump
Nalga|carnes|150|29|0|4|1 bife:150;1 porción:200;100 g:100|carne,carne magra,bola de lomo
Peceto|carnes|145|28|0|3.5|1 porción:200;100 g:100|carne,carne magra,peceto al horno
Colita de cuadril|carnes|190|27|0|9|1 porción:250;100 g:100|carne,picanha
Vacío|carnes|290|24|0|21|1 porción:250;100 g:100|carne,asado,vacio
Asado de tira|carnes|330|22|0|27|1 tira:300;1 porción:250;100 g:100|carne,asado,costilla
Matambre|carnes|260|25|0|17|1 porción:200;100 g:100|carne,asado
Entraña|carnes|270|24|0|19|1 porción:200;100 g:100|carne,asado,entrana
Tapa de asado|carnes|280|23|0|20|1 porción:250;100 g:100|carne,asado
Falda|carnes|300|20|0|24|1 porción:250;100 g:100|carne,puchero
Osobuco|carnes|200|27|0|10|1 rodaja:250;100 g:100|carne,puchero
Roast beef|carnes|220|26|0|12|1 porción:200;100 g:100|carne,carne para guiso
Carne picada común|carnes|280|18|0|23|1 porción:150;100 g:100|carne,picada
Carne picada magra|carnes|190|21|0|11|1 porción:150;100 g:100|carne,picada especial
Carne vacuna magra (genérica)|carnes|170|27|0|7|1 porción:200;100 g:100|carne,carne magra
Hígado de vaca|carnes|135|20|4|4|1 bife:150;100 g:100|higado
Chorizo|carnes|340|15|2|30|1 unidad:100;100 g:100|chori,embutido
Morcilla|carnes|380|14|13|31|1 unidad:100;100 g:100|embutido
Chinchulines|carnes|300|11|0|28|1 porción:150;100 g:100|achuras
Molleja|carnes|320|13|0|29|1 porción:150;100 g:100|achuras,mollejas
Bondiola de cerdo|carnes|240|19|0|18|1 porción:200;100 g:100|cerdo,chancho
Carré de cerdo|carnes|195|27|0|9|1 costeleta:180;100 g:100|cerdo,chuleta de cerdo,costeleta
Matambrito de cerdo|carnes|270|22|0|20|1 porción:250;100 g:100|cerdo,matambre
Lomo de cerdo|carnes|145|26|0|4|1 porción:200;100 g:100|cerdo
Pechito de cerdo|carnes|320|18|0|28|1 porción:250;100 g:100|cerdo,costillas
Cordero|carnes|280|24|0|20|1 porción:250;100 g:100|cordero asado
Jamón cocido|carnes|125|18|1.5|5|1 feta:20;3 fetas:60;100 g:100|jamon,fiambre
Jamón crudo|carnes|250|28|0|15|1 feta:15;4 fetas:60;100 g:100|jamon serrano,fiambre
Salame|carnes|400|22|1.5|34|1 feta:8;5 fetas:40;100 g:100|salamin,fiambre
Mortadela|carnes|310|14|3|27|1 feta:15;100 g:100|fiambre
Panceta|carnes|540|37|1.5|42|1 feta:10;100 g:100|bacon,tocino
Salchicha (pancho)|carnes|290|11|3|26|1 salchicha:50;100 g:100|salchichas,viena
Pechuga de pollo|aves|165|31|0|3.6|1 pechuga:200;1 filete:150;100 g:100|pollo,pechuga
Pata muslo de pollo|aves|215|26|0|12|1 pata muslo:220;100 g:100|pollo,muslo
Pollo al horno con piel|aves|240|27|0|14|1 cuarto:300;1 porción:250;100 g:100|pollo,pollo asado
Pollo a la parrilla|aves|210|29|0|10|1 cuarto:300;100 g:100|pollo
Alitas de pollo|aves|250|23|0|17|1 alita:40;6 alitas:240;100 g:100|pollo,alas
Pavo (pechuga)|aves|135|29|0|1.5|1 porción:150;100 g:100|pavita,pechuga de pavo
Fiambre de pavo|aves|105|18|3|2|1 feta:20;100 g:100|pavita,fiambre
Hamburguesa de pollo|aves|200|15|9|12|1 medallón:80;100 g:100|medallon de pollo
Nuggets de pollo|aves|290|15|17|18|1 unidad:18;6 unidades:110;100 g:100|patitas de pollo,bocaditos
Merluza|pescados|90|18|0|1.5|1 filet:150;100 g:100|pescado,filet de merluza
Merluza rebozada|pescados|210|14|15|10|1 filet:150;100 g:100|pescado frito,filet rebozado
Salmón|pescados|205|21|0|13|1 porción:150;100 g:100|salmon,pescado
Atún al natural|pescados|115|26|0|1|1 lata escurrida:120;100 g:100|atun,lata
Atún en aceite|pescados|200|25|0|11|1 lata escurrida:120;100 g:100|atun,lata
Caballa en lata|pescados|180|20|0|11|1 lata:120;100 g:100|pescado,lata
Sardinas en lata|pescados|210|25|0|12|1 lata:90;100 g:100|pescado
Surubí|pescados|105|18|0|3.5|1 porción:200;100 g:100|pescado de rio,pescado
Pacú|pescados|160|17|0|10|1 porción:200;100 g:100|pescado de rio,pescado
Dorado|pescados|110|20|0|3|1 porción:200;100 g:100|pescado de rio,pescado
Camarones|pescados|100|21|0.5|1.5|1 porción:150;100 g:100|langostinos,mariscos
Huevo|huevos|145|12.5|0.7|10|1 huevo:50;2 huevos:100;3 huevos:150|huevos,huevo duro,huevo hervido
Huevo frito|huevos|195|13.5|0.8|15|1 huevo:55;2 huevos:110|huevos fritos
Clara de huevo|huevos|52|11|0.7|0.2|1 clara:33;100 g:100|claras
Huevos revueltos|huevos|165|11|2|12|2 huevos:120;3 huevos:180|revuelto
Omelette de jamón y queso|huevos|210|14|1.5|16|1 omelette:200|tortilla de huevo,omelet
Leche entera|lacteos|61|3.2|4.8|3.2|1 vaso:250;1 taza:200;100 ml:100|leche
Leche descremada|lacteos|35|3.4|5|0.1|1 vaso:250;1 taza:200;100 ml:100|leche,leche light
Leche parcialmente descremada|lacteos|46|3.3|4.9|1.5|1 vaso:250;1 taza:200|leche,leche semi
Leche chocolatada|lacteos|80|3|11|2.5|1 vaso:250;1 cajita:200|chocolatada,cindor,leche con chocolate
Yogur entero natural|lacteos|65|3.5|5|3.3|1 pote:190;100 g:100|yogurt,yogur
Yogur bebible|lacteos|85|2.8|13|2.3|1 vaso:200;1 botella:900|yogurt,yogur
Yogur descremado|lacteos|45|4|6|0.1|1 pote:190;100 g:100|yogurt light,yogur
Yogur griego|lacteos|97|9|4|5|1 pote:160;100 g:100|yogurt griego
Yogur con cereales|lacteos|110|3.5|18|2.5|1 pote:160|yogurt con granola,yogur
Leche en polvo entera|lacteos|495|26|38|27|1 cucharada:10;100 g:100|leche polvo
Crema de leche|lacteos|340|2|3|35|1 cucharada:15;100 g:100|crema
Manteca|grasas|717|0.9|0.1|81|1 cucharadita:5;1 cucharada:14|mantequilla
Dulce de leche|dulces|315|7|55|7|1 cucharada:20;1 cucharada colmada:30|ddl
Queso cremoso|quesos|300|20|1|24|1 porción:40;1 feta:20;100 g:100|queso,cremoso,queso por salut
Queso mozzarella|quesos|280|22|2.5|20|1 porción:40;100 g:100|muzzarella,muzza,queso
Queso tybo|quesos|340|25|1|26|1 feta:20;100 g:100|queso de maquina,queso en fetas,queso
Queso rallado|quesos|430|38|3|29|1 cucharada:6;100 g:100|parmesano,reggianito,queso
Queso crema|quesos|250|6|4|24|1 cucharada:15;100 g:100|casancrem,queso untable
Queso untable light|quesos|130|10|5|8|1 cucharada:15;100 g:100|queso light,queso blanco
Ricota|quesos|150|11|3.5|10|1 cucharada:30;100 g:100|ricotta
Queso fresco|quesos|260|18|2|20|1 porción:40;100 g:100|queso
Queso azul|quesos|350|21|2|29|1 porción:30|roquefort,queso
Provoleta|quesos|350|25|2|27|1 provoleta:120|provolone,queso a la parrilla
Arroz blanco cocido|cereales|130|2.7|28|0.3|1 plato:200;1 taza:160;100 g:100|arroz
Arroz integral cocido|cereales|112|2.6|23|0.9|1 plato:200;1 taza:160;100 g:100|arroz
Arroz blanco crudo|cereales|360|7|79|0.6|1 taza:185;100 g:100|arroz
Avena|cereales|380|13|67|7|1 taza:80;3 cucharadas:30;100 g:100|copos de avena,avena arrollada
Granola|cereales|450|10|64|17|1 taza:110;3 cucharadas:40|cereal
Cereales de maíz (copos)|cereales|375|7|84|1|1 taza:30;1 bowl:45|corn flakes,copos,cereal
Quinoa cocida|cereales|120|4.4|21|1.9|1 taza:185;100 g:100|quinua
Polenta cocida|cereales|70|1.6|15|0.3|1 plato:250;100 g:100|harina de maiz
Choclo|verduras|96|3.4|21|1.5|1 choclo:150;1 lata escurrida:200;100 g:100|maiz,elote
Pan francés|panificados|270|9|56|1.5|1 pancito:50;1 flauta chica:100;100 g:100|pan,pancito,mignon
Pan lactal blanco|panificados|265|8|49|3.5|1 rodaja:25;2 rodajas:50|pan de molde,pan lactal,pan
Pan lactal integral|panificados|250|10|43|4|1 rodaja:28;2 rodajas:56|pan integral,pan de molde,pan
Pan de hamburguesa|panificados|270|9|49|4|1 pan:60|pan de hamburguesa,pan
Pan de pancho|panificados|275|9|50|4|1 pan:45|pan de pancho,pan
Tostadas de pan|panificados|390|11|74|5|1 tostada:10;3 tostadas:30|tostadas
Galletitas de agua|panificados|420|10|70|11|1 galletita:6;4 galletitas:24;1 paquete chico:100|crackers,criollitas,galletas
Galletitas de arroz|panificados|385|8|81|3|1 galleta:9;3 galletas:27|galletas de arroz
Bizcochitos de grasa|panificados|480|8|58|24|1 bizcochito:8;10 bizcochitos:80|bizcochos,don satur
Medialuna de manteca|panificados|410|8|46|21|1 medialuna:45|medialunas,croissant
Medialuna de grasa|panificados|390|8|48|19|1 medialuna:40|medialunas
Factura (promedio)|panificados|420|7|51|21|1 factura:50|facturas,vigilante,bola de fraile,cañoncito
Prepizza|panificados|260|7|49|4|1 prepizza:300;1 porción:75|pizza base
Tapa de empanada|panificados|330|7|50|11|1 tapa:30|tapas
Tortilla de trigo (wrap)|panificados|300|8|50|8|1 tortilla:45|rapiditas,tortillas,wrap
Bizcochuelo|panificados|330|6|54|10|1 porción:60|torta,bizcochuelo casero
Fideos secos cocidos|pastas|155|5.5|31|0.9|1 plato:250;1 taza:140;100 g:100|fideos,pasta,spaghetti,tallarines,mostachol
Fideos secos crudos|pastas|360|12.5|73|1.5|1 porción cruda:100;100 g:100|fideos,pasta
Fideos integrales cocidos|pastas|145|6|28|1.2|1 plato:250;100 g:100|fideos,pasta integral
Ñoquis de papa|pastas|150|3.5|31|1|1 plato:300;100 g:100|noquis,ñoquis
Ravioles de ricota|pastas|230|9|30|8|1 plato:300;100 g:100|ravioles,pasta rellena
Ravioles de carne y verdura|pastas|240|10|31|8|1 plato:300;100 g:100|ravioles
Sorrentinos de jamón y queso|pastas|250|11|29|10|1 plato:300;100 g:100|sorrentinos
Canelones de verdura|pastas|170|8|16|8|2 canelones:300|canelones
Lasaña de carne|pastas|165|10|14|8|1 porción:300|lasagna,lasaña
Lentejas cocidas|legumbres|116|9|20|0.4|1 plato:250;1 taza:200;100 g:100|lentejas
Garbanzos cocidos|legumbres|165|9|27|2.6|1 taza:165;100 g:100|garbanzo
Porotos cocidos|legumbres|127|8.7|23|0.5|1 taza:180;100 g:100|frijoles,alubias,porotos negros
Arvejas|legumbres|80|5.4|14|0.4|1 taza:160;1 lata escurrida:200|guisantes
Hummus|legumbres|170|8|14|10|2 cucharadas:30;100 g:100|humus
Soja texturizada hidratada|legumbres|110|16|8|1|1 porción:100|soja
Tofu|legumbres|80|8|2|4.8|1 porción:100|soja
Lechuga|verduras|15|1.4|2.9|0.2|1 plato:80;1 hoja:10|ensalada,lechuga criolla
Tomate|verduras|18|0.9|3.9|0.2|1 tomate mediano:120;1 tomate chico:80|tomates
Cebolla|verduras|40|1.1|9.3|0.1|1 cebolla:110;1/2 cebolla:55|cebollas
Zanahoria|verduras|41|0.9|9.6|0.2|1 zanahoria:70;1 taza rallada:110|zanahorias
Papa hervida|verduras|87|1.9|20|0.1|1 papa mediana:170;100 g:100|papas,patata
Papa al horno|verduras|93|2.5|21|0.1|1 papa mediana:170;1 porción:200|papas al horno,papa asada
Papas fritas caseras|verduras|310|3.4|41|15|1 porción:150;1 porción chica:100|papas fritas,fritas
Puré de papa|verduras|105|2|15|4|1 porción:200;1 taza:210|pure,puré
Batata hervida|verduras|86|1.6|20|0.1|1 batata mediana:150;100 g:100|boniato,camote
Batata al horno|verduras|90|2|21|0.2|1 batata mediana:150;100 g:100|batatas
Zapallo|verduras|26|1|6.5|0.1|1 porción:200;100 g:100|calabaza,anco
Zapallito|verduras|17|1.2|3.1|0.3|1 zapallito:150;100 g:100|zucchini,zapallito verde
Berenjena|verduras|25|1|6|0.2|1 berenjena:250;100 g:100|berenjenas
Brócoli|verduras|34|2.8|7|0.4|1 taza:90;1 porción:150|brocoli
Coliflor|verduras|25|1.9|5|0.3|1 taza:100;1 porción:150|
Espinaca|verduras|23|2.9|3.6|0.4|1 taza cocida:180;1 taza cruda:30|acelga,espinacas
Acelga cocida|verduras|20|1.9|4|0.1|1 taza:175;100 g:100|acelga
Pepino|verduras|15|0.7|3.6|0.1|1 pepino:200;100 g:100|
Morrón|verduras|26|1|6|0.3|1 morrón:150;100 g:100|pimiento,aji morron
Repollo|verduras|25|1.3|5.8|0.1|1 taza:90;100 g:100|repollo blanco,col
Remolacha|verduras|43|1.6|9.6|0.2|1 remolacha:100;100 g:100|beterraga
Champiñones|verduras|22|3.1|3.3|0.3|1 taza:70;100 g:100|hongos
Ensalada mixta|verduras|25|1.2|4.5|0.2|1 plato:200|ensalada,lechuga tomate cebolla
Ensalada con aceite|verduras|70|1.2|4.5|5.5|1 plato:220|ensalada aliñada,ensalada condimentada
Verduras salteadas|verduras|65|2|8|3|1 porción:200|wok de verduras
Palta|frutas|160|2|8.5|14.7|1/2 palta:100;1 palta mediana:200;2 cucharadas:30|aguacate,avocado
Banana|frutas|89|1.1|23|0.3|1 banana mediana:120;1 banana grande:150|platano,banano
Manzana|frutas|52|0.3|14|0.2|1 manzana mediana:180|manzanas
Naranja|frutas|47|0.9|12|0.1|1 naranja:180|naranjas
Mandarina|frutas|53|0.8|13|0.3|1 mandarina:90|mandarinas
Pera|frutas|57|0.4|15|0.1|1 pera:180|peras
Durazno|frutas|39|0.9|10|0.3|1 durazno:150|melocoton,duraznos
Frutillas|frutas|32|0.7|7.7|0.3|1 taza:150|fresas,frutilla
Uvas|frutas|69|0.7|18|0.2|1 taza:150|uva
Kiwi|frutas|61|1.1|15|0.5|1 kiwi:75|kiwis
Ananá|frutas|50|0.5|13|0.1|1 rodaja:80;1 taza:165|piña,anana
Sandía|frutas|30|0.6|7.6|0.2|1 tajada:300|sandia
Melón|frutas|34|0.8|8|0.2|1 tajada:200|melon
Mango|frutas|60|0.8|15|0.4|1 mango:200|
Limón (jugo)|frutas|22|0.4|7|0.2|1 cucharada:15|limon,jugo de limon
Arándanos|frutas|57|0.7|14|0.3|1 taza:150|arandanos,blueberries
Ciruela|frutas|46|0.7|11|0.3|1 ciruela:65|ciruelas
Pasas de uva|frutas|300|3|79|0.5|1 cucharada:15;1 puñado:30|pasas
Dátiles|frutas|280|2.5|75|0.4|1 dátil:8|datiles
Coco rallado|frutas|660|7|24|65|1 cucharada:7|coco
Aceite de oliva|grasas|884|0|0|100|1 cucharada:13;1 cucharadita:4|oliva,aceite
Aceite de girasol|grasas|884|0|0|100|1 cucharada:13;1 cucharadita:4|aceite
Mayonesa|grasas|680|1|1|75|1 cucharada:15;1 sobre:8|mayo,hellmanns
Mayonesa light|grasas|300|1|6|30|1 cucharada:15|mayo light
Ketchup|grasas|100|1.2|26|0.1|1 cucharada:15;1 sobre:10|salsa de tomate ketchup
Mostaza|grasas|65|4|5|3.5|1 cucharadita:5|
Salsa golf|grasas|480|1|8|50|1 cucharada:15|golf
Chimichurri|grasas|450|1|4|48|1 cucharada:15|
Salsa de tomate|grasas|35|1.5|7|0.3|1/2 taza:125;1 porción:100|tuco,salsa pomarola,pomarola
Salsa bolognesa|platos|120|7|6|7.5|1 porción:150|tuco con carne,bolognesa
Salsa blanca|platos|130|4|10|8|1 porción:100|bechamel
Maní|grasas|590|25|16|50|1 puñado:30;100 g:100|mani,cacahuate
Mantequilla de maní|grasas|590|25|20|50|1 cucharada:16;2 cucharadas:32|pasta de mani,mani untable,peanut butter
Almendras|grasas|580|21|22|50|1 puñado:30;10 almendras:12|
Nueces|grasas|654|15|14|65|1 puñado:30;5 nueces:20|
Castañas de cajú|grasas|553|18|30|44|1 puñado:30|castañas,caju
Mix de frutos secos|grasas|600|17|20|52|1 puñado:30|frutos secos
Semillas de chía|grasas|490|17|42|31|1 cucharada:12|chia
Semillas de girasol|grasas|585|21|20|51|1 cucharada:10|semillas
Aceitunas|grasas|145|1|4|15|5 aceitunas:20;10 aceitunas:40|aceituna
Milanesa de carne frita|platos|290|19|14|17|1 milanesa grande:200;1 milanesa chica:120|milanesa,milanga,milanesa de ternera
Milanesa de carne al horno|platos|225|20|14|9|1 milanesa grande:180;1 milanesa chica:110|milanesa,milanga,milanesa al horno
Milanesa de pollo al horno|platos|200|21|13|7|1 milanesa grande:180;1 milanesa chica:110|milanesa de pollo,suprema
Milanesa de pollo frita|platos|265|19|13|15|1 milanesa grande:200|suprema frita,milanesa de pollo
Milanesa napolitana|platos|260|19|10|16|1 milanesa:280|napolitana,milanesa a la napolitana
Milanesa de soja|platos|230|10|25|10|1 milanesa:100|milanesa vegetal
Suprema a la napolitana|platos|240|21|8|14|1 suprema:280|napolitana de pollo
Empanada de carne al horno|platos|270|11|25|14|1 empanada:90;3 empanadas:270|empanada,empanadas
Empanada de carne frita|platos|320|10|25|20|1 empanada:90|empanada frita
Empanada de jamón y queso|platos|290|12|26|15|1 empanada:85|empanada,empanadas
Empanada de pollo|platos|250|12|25|11|1 empanada:90|empanada,empanadas
Empanada de humita|platos|240|6|30|11|1 empanada:90|empanada,empanadas,choclo
Empanada de verdura|platos|230|7|27|10|1 empanada:85|empanada de acelga,empanadas
Pizza de muzzarella|platos|265|11|30|11|1 porción:120;2 porciones:240;1 pizza entera:950|pizza,muzza
Pizza napolitana|platos|250|11|29|10|1 porción:125|pizza,pizza con tomate
Pizza de jamón y morrones|platos|255|13|28|10|1 porción:130|pizza especial
Fugazzeta|platos|290|11|30|14|1 porción:130|pizza de cebolla,fugazza
Faina|platos|250|8|30|11|1 porción:80|fainá
Tarta de verdura|platos|220|8|18|13|1 porción:180|tarta de acelga,tarta,pascualina
Tarta de jamón y queso|platos|280|11|20|17|1 porción:170|tarta
Tortilla de papa|platos|170|6|13|10|1 porción:200|tortilla española
Pastel de papa|platos|150|8|12|8|1 porción:300|pastel de carne
Guiso de lentejas|platos|120|7|14|4|1 plato:350|guiso
Locro|platos|130|7|12|6|1 plato:400|
Puchero|platos|95|8|7|4|1 plato:450|
Estofado de carne|platos|130|11|7|6|1 plato:350|carne al jugo,estofado
Arroz con pollo|platos|150|10|18|4|1 plato:350|
Fideos con tuco|platos|135|5|25|2|1 plato:350|fideos con salsa,spaghetti con salsa
Fideos con bolognesa|platos|155|8|22|4|1 plato:350|fideos con carne
Fideos con manteca y queso|platos|200|7|28|7|1 plato:300|fideos con manteca
Ensalada César|platos|160|9|8|11|1 plato:250|cesar
Ensalada rusa|platos|150|2|12|11|1 porción:150|
Ensalada de atún|platos|120|11|6|6|1 plato:250|
Matambre a la pizza|platos|250|22|3|17|1 porción:250|matambre
Pollo al disco|platos|150|15|5|8|1 porción:350|
Revuelto gramajo|platos|230|10|14|15|1 porción:300|gramajo
Sopa de verduras|platos|35|1.5|6|0.5|1 plato:300|caldo,sopa
Hamburguesa casera|rapida|250|19|1|19|1 medallón:120;1 medallón grande:180|hamburguesa,medallon,burger
Hamburguesa congelada|rapida|260|14|5|21|1 medallón:80|paty,swift,hamburguesa
Hamburguesa completa|rapida|255|13|21|13|1 hamburguesa:300;1 hamburguesa doble:420|hamburguesa con pan,burger,mcdonalds
Hamburguesa de cadena (doble con queso)|rapida|265|15|20|14|1 unidad:230|big mac,cuarto de libra,burger king
Choripán|rapida|300|12|25|17|1 choripán:250|chori,choripan
Pancho|rapida|260|9|26|13|1 pancho:110|hot dog,panchos
Lomito completo|rapida|240|14|17|13|1 lomito:400|lomito
Sándwich de milanesa|rapida|270|14|26|12|1 sándwich:300|milanesa al pan,sanguche de milanesa
Sándwich de jamón y queso|rapida|280|15|27|12|1 sándwich:130;1 tostado:150|sanguche,tostado,carlitos
Sándwich de miga|rapida|270|9|28|13|1 sándwich:45;3 sándwiches:135|sandwich de miga
Shawarma|rapida|215|13|18|10|1 shawarma:350|kebab,doner
Tacos|rapida|220|10|20|11|1 taco:100|
Sushi (pieza)|rapida|150|5|28|2|1 pieza:25;1 combo 15 piezas:375|sushi,rolls,niguiri
Papas fritas de cadena|rapida|320|3.5|42|15|1 porción mediana:115;1 porción grande:150|papas fritas,fritas mcdonalds
Café negro|bebidas|2|0.1|0|0|1 taza:150;1 pocillo:60|cafe,expreso,espresso
Café con leche|bebidas|40|2|3.5|2|1 taza:250|cafe con leche,cortado,latte
Cortado|bebidas|30|1.5|2.5|1.5|1 pocillo:100|cafe cortado
Capuchino|bebidas|50|2.7|5|2|1 taza:250|cappuccino
Mate (cebado)|bebidas|2|0|0.3|0|1 termo:1000;1 mate:40|yerba,mate amargo
Té|bebidas|1|0|0.2|0|1 taza:250|te
Azúcar|dulces|400|0|100|0|1 cucharadita:5;1 sobre:5|azucar
Edulcorante|dulces|0|0|0|0|1 gota:1|stevia,sacarina
Miel|dulces|304|0.3|82|0|1 cucharada:21;1 cucharadita:7|
Mermelada|dulces|250|0.4|62|0.1|1 cucharada:20|dulce,jalea
Mermelada light|dulces|120|0.3|30|0|1 cucharada:20|
Jugo de naranja exprimido|bebidas|45|0.7|10|0.2|1 vaso:250|jugo,jugo natural
Jugo en caja|bebidas|45|0.2|11|0|1 vaso:250;1 cajita:200|jugo,cepita,ades
Jugo en polvo preparado|bebidas|10|0|2.5|0|1 vaso:250|tang,clight,baggio
Gaseosa común|bebidas|42|0|10.6|0|1 lata:354;1 vaso:250;1 botella chica:500|coca,coca cola,sprite,fanta,pepsi,gaseosa
Gaseosa sin azúcar|bebidas|0.5|0|0|0|1 lata:354;1 vaso:250|coca zero,light,gaseosa light
Agua saborizada|bebidas|20|0|5|0|1 vaso:250;1 botella:500|levite,aquarius
Bebida isotónica|bebidas|25|0|6|0|1 botella:500|gatorade,powerade
Bebida energizante|bebidas|45|0|11|0|1 lata:250|speed,red bull,monster
Cerveza|bebidas|43|0.5|3.6|0|1 vaso:330;1 lata:473;1 litro:1000;1 porrón:330|birra,quilmes,cerveza rubia
Cerveza sin alcohol|bebidas|25|0.4|5|0|1 lata:473|
Vino tinto|bebidas|85|0.1|2.6|0|1 copa:150;1 botella:750|vino,malbec
Vino blanco|bebidas|82|0.1|2.6|0|1 copa:150|vino
Fernet con coca|bebidas|90|0|11|0|1 vaso:300|fernet,fernet con cola
Fernet|bebidas|250|0|20|0|1 medida:50|
Gancia con sprite|bebidas|70|0|10|0|1 vaso:300|gancia
Vodka|bebidas|231|0|0|0|1 medida:50|
Whisky|bebidas|250|0|0|0|1 medida:50|
Agua|bebidas|0|0|0|0|1 vaso:250;1 botella:500;1 litro:1000|agua mineral
Licuado de banana con leche|bebidas|75|2.8|12|2|1 vaso:300|licuado,batido
Smoothie de frutas|bebidas|55|0.8|13|0.2|1 vaso:300|
Proteína whey|suplementos|400|80|8|6|1 scoop:30;1 scoop y medio:45|whey,proteina,proteína en polvo,batido de proteína
Batido de whey con leche|suplementos|95|11|7|2.5|1 vaso:330|batido de proteina,shake
Creatina|suplementos|0|0|0|0|1 dosis:5|creatina monohidrato
Barra de proteína|suplementos|360|30|38|11|1 barra:50|barrita proteica
Ganador de peso|suplementos|380|20|70|3|1 porción:100|mass gainer
Barra de cereal|snacks|400|6|70|10|1 barra:25|cereal mix,barrita
Papas fritas de paquete|snacks|536|6|53|34|1 puñado:30;1 paquete chico:45;1 paquete grande:150|lays,pringles,papitas
Palitos salados|snacks|380|9|76|4|1 puñado:30|palitos
Chizitos|snacks|540|6|55|33|1 paquete:50|chizito,conitos
Pochoclo salado|snacks|480|9|58|25|1 bolsa:60;1 balde chico:100|pochoclos,pop corn,palomitas
Galletitas dulces|dulces|470|6|70|18|1 galletita:10;4 galletitas:40;1 paquete:120|galletas dulces,oreo,pepitos,variedad
Galletitas rellenas|dulces|480|5|70|20|1 galletita:12;3 galletitas:36|oreo,melba,rellenas
Alfajor de chocolate|dulces|440|5|60|20|1 alfajor:50;1 alfajor triple:70|alfajor,havanna,jorgito,guaymallen
Alfajor de maicena|dulces|420|5|65|15|1 alfajor:45|alfajores
Chocolate con leche|dulces|540|7|58|31|1 barrita:25;1 tableta:100|chocolate,milka,aguila
Chocolate amargo 70 %|dulces|600|8|46|43|1 cuadradito:10;1 tableta:100|chocolate negro
Helado de crema|dulces|210|3.5|25|11|1 cucurucho:120;1/4 kg:250;1 bocha:70|helado,cucurucho
Helado de agua|dulces|80|0|20|0|1 palito:70|
Flan con dulce de leche|dulces|200|5|33|5|1 porción:150|flan
Torta de chocolate|dulces|380|5|50|18|1 porción:100|torta,chocotorta
Chocotorta|dulces|400|6|42|23|1 porción:120|torta
Brownie|dulces|430|5|55|22|1 brownie:60|
Budín|dulces|380|5|55|16|1 rodaja:50|budin,pound cake
Churro|dulces|420|5|45|25|1 churro:40;1 churro relleno:60|churros
Turrón|dulces|420|7|60|17|1 turrón:25|turron de mani
Gelatina|dulces|62|1.2|14|0|1 porción:120|gelatina light
Postre de chocolate (vasito)|dulces|125|3|20|3.5|1 vasito:100|serenito,postrecito
Ensalada de frutas|frutas|55|0.6|14|0.2|1 compotera:200|ensalada de fruta,macedonia
Puré de calabaza|verduras|55|1.2|9|1.8|1 porción:200|pure de zapallo
Medallón de verdura|platos|180|5|20|9|1 medallón:80|hamburguesa vegetal
Pizza (porción de pizzería)|platos|280|12|31|12|1 porción:140|pizza
Calzone|platos|270|12|28|12|1 calzone:350|
Tostado de jamón y queso|rapida|285|15|27|13|1 tostado:150|tostado,sandwich tostado
Pebete de jamón y queso|rapida|285|13|33|11|1 pebete:150|pebete
Wrap de pollo|rapida|210|13|20|8|1 wrap:250|tortilla rellena
Picada (fiambres y quesos)|rapida|350|20|3|29|1 porción:150|picada
`
