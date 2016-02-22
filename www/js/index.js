/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
//variáveis gerais
var urlWebServiceSoftnews = 'https://design.softplan.com.br/webserviceSoftnews';
var urlWebServiceCarona = 'https://carona.softplan.com.br/webservice';
var urlWebServiceCallback = 'http://cbsrv.softplan.com.br:443/CallBackWebService/callback';
var tempoRespostaLimite = 25000; //25 segundos
var nomeUser = "";

var login = ""
if(localStorage.getItem('login') != "") {
    login = localStorage.getItem('login');
}

var senha = ""
if(localStorage.getItem('senha') != "") {
    localStorage.setItem('senha', "");
    senha = "";
}

var habilitadoParaLigacoes = true; //quando callback estiver todo implementado trocar para false
var fazLigacao = true; //quando callback estiver todo implementado trocar para null
//DESABILITADO POR ENQUANTO
//if(localStorage.getItem('fazligacao') != "") {
//    fazLigacao = localStorage.getItem('fazLigacao');
//}

var numTelefone = null;
if(localStorage.getItem('numTelefone') != "") {
    numTelefone = localStorage.getItem('numTelefone');
}

//variáveis softnews
var fonte = 11;
var arrayIdsNoticias = new Array();
var arrayIdsAnuncios = new Array();
var arrayIdsMeusAnuncios = new Array();

//variáveis carona
var map = new L.Map('mapa',{zoomControl: false});
var markers = new L.FeatureGroup();
var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
var osmAttrib='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
var osm = new L.TileLayer(osmUrl, {minZoom: 1, maxZoom: 19, attribution: osmAttrib});
var mapaIniciado = false;
var latFlorianopolis        = -27.571134;
var longFlorianopolis       = -48.508458;
var centLatFlorianopolis    = -27.597152;
var centerLongFlorianopolis = -48.567917;
var latSaoPaulo             = -23.546051;
var longSaoPaulo            = -46.636035;
var centLatSaoPaulo         = -23.546051;
var centerLongSaoPaulo      = -46.636035;
var latPalhoca              = -27.6237085;
var longPalhoca             = -48.6746541;
var centLatPalhoca          = -27.621713;
var centerLongPalhoca       = -48.650980;

var cidadeAtual = "";
if(localStorage.getItem('alocado') != null) {
    cidadeAtual = localStorage.getItem('alocado');
}

//variáveis mural
var ultimaPesquisa = "";
var timerMural;

//variáveis callback
var ultimoFiltro = "";
var timerCrt;

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
        //transiÃ§Ã£o padrÃ£o de pÃ¡gina
        $.mobile.defaultPageTransition = "none";
        //iniciando paineis
        $("[data-role=panel]").panel().enhanceWithin();
        setTimeout(function(){
            if(app.checkConnection()){
                if(login !== null){
                    $("#login").val(login);
                }
                app.abreLogin();
                $('#endereco').blur(function(){
                    var end = $('#endereco').val();
                    if(end != ""){
                        app.latLongEndereco(end);
                    }
                });
                $('#endereco').keypress(function(e){
                    //se clicar enter 
                    if(e.keyCode == 13) { 
                     e.preventDefault();
                     app.latLongEndereco();
                    }
                });
            }
        }, 500);
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        //descomentar caso o app não seja fullscreen
        //if (navigator.userAgent.match(/(iPad.*|iPhone.*|iPod.*);.*CPU.*OS 7_\d/i)) {
        //    $("body").addClass("ios7");
        //    $('<div>').prependTo('#body').attr('id','ios7statusbar');
        //}
        navigator.splashscreen.hide();
        StatusBar.hide();
    },
    //my functions
    getDocWidth: function(){
        var width = (
        'innerWidth' in window? window.innerWidth :
        document.compatMode!=='BackCompat'? document.documentElement.clientWidth :
        document.body.clientWidth
        );
        return width;
    },
    getDocHeight: function(){
        var height = (
        'innerHeight' in window? window.innerHeight :
        document.compatMode!=='BackCompat'? document.documentElement.clientHeight :
        document.body.clientHeight
        );
        return height;
    },
    checkConnection: function() {
        return true; //descomentar o return true para fazer homologação no desktop
        var networkState = navigator.connection.type;
        var states = {};
        states[Connection.UNKNOWN]  = 'Unknown connection';
        states[Connection.ETHERNET] = 'Ethernet connection';
        states[Connection.WIFI]     = 'WiFi connection';
        states[Connection.CELL_2G]  = 'Cell 2G connection';
        states[Connection.CELL_3G]  = 'Cell 3G connection';
        states[Connection.CELL_4G]  = 'Cell 4G connection';
        states[Connection.CELL]     = 'Cell generic connection';
        states[Connection.NONE]     = 'No network connection';
        if (states[networkState] == "No network connection") { 
            app.loading(false);
            navigator.notification.alert('Você está sem conexão com a internet.', function(){}, 'Atenção', 'Ok');
            return false;
        } else {
            return true;
        }
    },
    semRespostaServidor: function() {
        navigator.notification.alert('Servidor não responde. Confira conexão com a internet.', function(){}, 'Atenção', 'Ok');
    },
    loading: function(acao, texto){
        if(acao == true) {
            $.mobile.loading("show", { text: texto, textVisible: true });
        } else {
            $.mobile.loading("hide");
        }
    },
    checkCampoTelefone: function(telefone){
        //formatos que vão aceitar: (00) 0000-0000 ou (00) 0000-00000
	var reDigits = /^(\([1-9][0-9]\) [1-9][0-9]{3}-[0-9]{4})|(\([1-9][0-9]\) [1-9][0-9]{3}-[0-9]{5})$/;
	if (!reDigits.test(telefone)){
            return false;
	} else {
            return true;
        }
    },
    abreLogin: function(){
        $.mobile.changePage("#inicial", { changeHash: true, transition: 'fade' });       
        $("#login").keypress(function(){
           var minusculos = $("#login").val().toLowerCase();
           $("#login").val(minusculos);
        });
    },
    abreMenuInicial: function(){
        $.mobile.changePage("#menuPrincipal", { changeHash: true, transition: 'fade' });        
    },
    abreCarona: function(cidade, apenasVisualizar, tiposPontos){
        if(localStorage.getItem('tutorialCarona') == null){
            app.carregaTutorialCarona(false);
        } else {
            
            if(tiposPontos == null){
                tiposPontos = "todos";
            }
            
            if(cidade !== null){
                cidadeAtual = cidade;
            }
            
            if(cidadeAtual == "") {
                cidadeAtual = "sao paulo";
            }
            
            switch (cidadeAtual){
                case 'florianopolis':
                    var btnSelect  = '.btnCidade.florianopolis';
                    var centerLat  = centLatFlorianopolis;
                    var centerLong = centerLongFlorianopolis;
                    var latCidade  = latFlorianopolis;
                    var longCidade = longFlorianopolis;
                break;
                case 'sao paulo':
                    var btnSelect  = '.btnCidade.saopaulo';
                    var centerLat  = centLatSaoPaulo;
                    var centerLong = centerLongSaoPaulo;
                    var latCidade  = latSaoPaulo;
                    var longCidade = longSaoPaulo;
                break;
                case 'palhoca':
                    var btnSelect  = '.btnCidade.palhoca';
                    var centerLat  = centLatPalhoca;
                    var centerLong = centerLongPalhoca;
                    var latCidade  = latPalhoca;
                    var longCidade = longPalhoca;
                break;
            }
            
            $('.btnCidade span.ic').css('display','none');
            $(btnSelect + ' span.ic').css('display','block');
            
            $('.btnFiltro span.ic').css('display','none');
            $('.btnFiltro.' + tiposPontos + ' span.ic').css('display','block');
            
            var myIconSoftplan = L.icon({
                iconUrl: 'img/ic-softplan-mapa.svg',
                iconSize: [30, 42],
                iconAnchor: [20, 41],
                popupAnchor: [-3, -35]
            });
            
            app.checkConnection();
            app.loading(true, 'Carregando...');
            $.mobile.changePage("#carona", { changeHash: true });
            $('.ui-responsive-panel').panel('close');
            if(mapaIniciado == false) {
                mapaIniciado = true;
                
                // start the map in South-East England
                map.setView(new L.LatLng(centerLat,centerLong),11);
                map.addLayer(osm);
                
                var marker = L.marker([latCidade,longCidade],{icon: myIconSoftplan});
                markers.addLayer(marker);  

                map.addLayer(markers);
                
                map.whenReady(
                    app.loadMarkers(apenasVisualizar, tiposPontos)
                );
                
            } else {
                //destroy mapa atual
                markers.clearLayers();
                mapaIniciado = false;
                app.abreCarona(null, apenasVisualizar, tiposPontos);
            }
        }
    },
    addMarker: function(id, tipo, lat, long){
         
        var myIcon = L.icon({
            iconUrl: "img/ic-carona-" + tipo + "-mapa.svg",
            iconSize: [30, 42],
            iconAnchor: [20, 41],
            popupAnchor: [-3, -35]
        });
        
        var marker = L.marker([lat,long],{icon: myIcon})
            .on('click', function(e) {
                app.carregaDadosInscrito(id);
            });
        markers.addLayer(marker); 

        map.addLayer(markers);
        
    },
    loadMarkers: function(apenasVisualizar, tiposPontos){
        if(app.checkConnection()){
            app.loading(true, 'Carregando...');

            $.ajax({
                url: urlWebServiceCarona + '/web_service.php?car=ca_markers&login=' + login + '&senha=' + senha + '&cidade=' + cidadeAtual + '&pontos=' + tiposPontos + '&callback=?',
                dataType: 'json',
                timeout: 10000,
                error: function(jqXHR, textStatus, errorThrown) {
                    app.loading(false);
                    if(textStatus==="timeout") {
                        return app.semRespostaServidor();
                    }
                },
                success: function(data) {
                    if(data == null) {
                        app.loginError();
                    } else {
                        //lendo todo Json
                        if(data.marker != null){
                            //se user logado solicita
                            if((data.user.tipo == "solicita") || (data.user.status == "0")){
                                $('#btnLotacao').css('display','none');
                            } else {
                                $('#btnLotacao').css('display','block');
                            }
                            if((data.user.lotado != "0") && (data.user.status != "0")){
                                $('#btnLotacao').addClass('lotado');
                                $('#btnLotacao span.ic').html('<img src="img/ic-span-oferece-off.svg" width="100%"/>');
                            } else {
                                $('#btnLotacao span.ic').html('<img src="img/ic-span-oferece.svg" width="100%"/>');
                            }
                            //se user logado oferece
                            if((data.user.tipo == "oferece") || (data.user.status == "0")){
                                $('#btnConseguiCarona').css('display','none');
                            } else {
                                $('#btnConseguiCarona').css('display','block');
                            }
                            if((data.user.consegui_carona != "0") && (data.user.status != "0")){
                                $('#btnConseguiCarona').addClass('consegui');
                                $('#btnConseguiCarona span.ic').html('<img src="img/ic-span-solicita-off.svg" width="100%"/>');
                            } else {
                                $('#btnConseguiCarona span.ic').html('<img src="img/ic-span-solicita.svg" width="100%"/>');
                            }
                            //seta cidade padrão do user
                            if(data.user.status != "0"){
                                $('.btnPerfilCriado').css('display','block');
                                $('.btnCriarPerfil').css('display','none');
                                localStorage.setItem('alocado', data.user.alocado);
                                if((apenasVisualizar === false) && (data.user.alocado !== cidadeAtual)){
                                    cidadeAtual = data.user.alocado;
                                    app.abreCarona(null, false, null);
                                }
                            } else {
                                $('.btnPerfilCriado').css('display','none');
                                $('.btnCriarPerfil').css('display','block');
                            }
                            if(data.marker.length == null) {
                                app.addMarker(data.marker.id, data.marker.tipo, data.marker.latitude, data.marker.longitude);
                            } else {
                                for (i = 0; i < data.marker.length; i++) {
                                    app.addMarker(data.marker[i].id, data.marker[i].tipo, data.marker[i].latitude, data.marker[i].longitude);
                                }
                            }
                        }
                        app.loading(false);
                    }
                }
            });
        }
    },
    carregaTutorialCarona: function(tpChangeHash){
        $.mobile.changePage("#tutorialCarona", { changeHash: tpChangeHash });
        $('#ulTutorialCarona').css('height', (app.getDocHeight()-130) + 'px');
        $('#ulTutorialCarona').append("<li class='slide tutorial'><img src='img/tut-carona-5.jpg'></li>");
        $('#ulTutorialCarona').append("<li class='slide tutorial'><img src='img/tut-carona-1.jpg'></li>");
        $('#ulTutorialCarona').append("<li class='slide tutorial'><img src='img/tut-carona-2.jpg'></li>");
        $('#ulTutorialCarona').append("<li class='slide tutorial'><img src='img/tut-carona-3.jpg'></li>");
        $('#ulTutorialCarona').append("<li class='slide tutorial'><img src='img/tut-carona-4.jpg'></li>");
        $('#ulTutorialCarona').glide({autoplay: false, animationDuration: 900});
        if(localStorage.getItem('tutorialCarona') == null) {
            localStorage.setItem('tutorialCarona', 1);
            $('#tutorialCarona #btnMenuTut').css('display','none');            
            $('#tutorialCarona .ui-content').css('display','block');
            $('#tutorialCarona .footer').css('display','none');
        } else {
            $('#tutorialCarona #btnMenuTut').css('display','initial');
            $('#tutorialCarona .ui-content').css('display','none');
            $('#tutorialCarona .footer').css('display','block');
        }
    },
    carregaEscolhaCidadeCarona: function(){
        $.mobile.changePage("#cidadeCarona", { changeHash: false });
    },
    politicaDeUsoCarona: function(){
        $.mobile.changePage("#politica", { role: 'dialog', changeHash: true });
    },
    carregaDadosInscrito: function(idInscrito){
        if(app.checkConnection()){
            app.loading(true, 'Carregando...');

            $('#caronaInscrito #header h1').empty();
            $('#caronaInscrito #content').empty();

            $.ajax({
                url: urlWebServiceCarona + '/web_service.php?car=ca_inscrito&login=' + login + '&senha=' + senha + '&dados=' + idInscrito + '_[x]_outro&callback=?',
                dataType: 'json',
                timeout: 10000,
                error: function(jqXHR, textStatus, errorThrown) {
                    app.loading(false);
                    if(textStatus==="timeout") {
                        return app.semRespostaServidor();
                    }
                },
                success: function(data) {
                    if(data == null) {
                        app.loginError();
                    } else {
                        $('#caronaInscrito #header h1').html(data.inscrito.tipo + ' carona');
                        var conteudo = '<h3>' + data.inscrito.nome + '</h3>';
                        conteudo = conteudo + '<p>';
                        if(data.inscrito.tipo == "oferece"){
                            conteudo = conteudo + "<strong>Num vagas:</strong> " + data.inscrito.num_vagas + '<br/>';
                        }
                        if((data.inscrito.tipo == "oferece") && (data.inscrito.automovel != "")){
                            conteudo = conteudo + "<strong>Automóvel:</strong> " + data.inscrito.automovel + '<br/>';
                        }
                        conteudo = conteudo + '<strong>E-mail:</strong> <a href="mailto:' + data.inscrito.email + '">' + data.inscrito.email + '</a><br/>';
                        conteudo = conteudo + '<strong>Fone:</strong> <a href="tel:' + data.inscrito.fone_formatado + '">' + data.inscrito.fone + '</a><br/>';
                        conteudo = conteudo + '<strong>Ramal:</strong> ' + data.inscrito.ramal + '<br/>';
                        conteudo = conteudo + '<strong>Endereço:</strong> ' + data.inscrito.endereco + '<br/>';
                        conteudo = conteudo + '<strong>Horário de entrada na empresa:</strong> ' + data.inscrito.horario_entrada + 'h<br/>';
                        conteudo = conteudo + '<strong>Horário de saída da empresa:</strong> ' + data.inscrito.horario_saida + 'h<br/>';
                        if(data.inscrito.observacoes != "") {
                            conteudo = conteudo + '<strong>Observações:</strong><br/>' + data.inscrito.observacoes.replace(/\u00c3\u00a0/g,'\u00e0');
                        }
                        conteudo = conteudo + '</p>';
                        $('#caronaInscrito #content').html(conteudo);
                        $.mobile.changePage("#caronaInscrito", { role: 'dialog', changeHash: true });
                        app.loading(false);
                    }
                }
            });
        }
    },
    carregaDadosPessoais: function(){
        if(app.checkConnection()){
            app.loading(true, 'Carregando...');
            //mascaras
            $(".maskRamal").mask("9999");
            $(".maskTelefone").mask("(99) 9999-9999?9");
            $(".maskHorario").mask("99:99");

            $.ajax({
                url: urlWebServiceCarona + '/web_service.php?car=ca_inscrito&login=' + login + '&senha=' + senha + '&dados=' + login + '&callback=?',
                dataType: 'json',
                timeout: 10000,
                error: function(jqXHR, textStatus, errorThrown) {
                    app.loading(false);
                    if(textStatus==="timeout") {
                        return app.semRespostaServidor();
                    }
                },
                success: function(data) {
                    if(data != null) {
                        app.numVagasShow(false);
                        var primeiroNome = nomeUser.split(' ');
                        $('#dadosCarona #nomePerfil').html(primeiroNome[0]);
                        var radios = $('input:radio[name=tipo]');
                        if((data.inscrito.tipo === 'solicita') && (data.inscrito.status === '1')){
                            radios.filter('[value=solicita]').prop('checked', true);
                            app.numVagasShow(false);
                        } else if((data.inscrito.tipo === 'oferece') && (data.inscrito.status === '1'))  {
                            radios.filter('[value=oferece]').prop('checked', true);
                            app.numVagasShow(true);
                        }
                        $('#num_vagas').val(data.inscrito.num_vagas);
                        if(data.inscrito.automovel == "") {
                            $('#automovel').empty();
                        } else {
                            $('#automovel').val(data.inscrito.automovel.replace(/\u00c3\u00a0/g,'\u00e0'));
                        }
                        $('#ramal').val(data.inscrito.ramal);
                        $('#telefone').val(data.inscrito.fone);
                        $('#logradouro').val(data.inscrito.endereco);
                        if(data.inscrito.endereco == ""){
                            $("#enderecoCompleto").css('display','block');
                        }
                        $('#latitude').val(data.inscrito.latitude);
                        $('#longitude').val(data.inscrito.longitude);
                        $('#alocado').val(data.inscrito.alocado);
                        $('#horario_entrada').val(data.inscrito.horario_entrada);
                        $('#horario_saida').val(data.inscrito.horario_saida);
                        if(data.inscrito.observacoes == "") {
                            $('#observacoes').empty();
                        } else {
                            $('#observacoes').val(data.inscrito.observacoes.replace(/\u00c3\u00a0/g,'\u00e0'));
                        }
                        $.mobile.changePage("#dadosCarona", { changeHash: true });
                        radios.checkboxradio("refresh");

                        //iniciando combo cidades/estados
                        new dgCidadesEstados({
                          estado: document.getElementById('uf'),
                          cidade: document.getElementById('cidade'),
                          estadoVal: 'SC',
                          cidadeVal: 'Florianópolis'
                        });
                        $('#uf').selectmenu('refresh');
                        $('#cidade').selectmenu('refresh');

                        app.loading(false);
                    }
                }
            });
        }
    },
    numVagasShow: function(tipo){
        if(tipo == true){
            $('#inputNumVagas').css('display','block');
        } else {
            $('#inputNumVagas').css('display','none');
        }
    },
    limpaEndereco: function(){
        $('#logradouro').val('');
        $('#latitude').val('');
        $('#longitude').val('');
        $('#enderecoCompleto').css('display','block');
    },
    latLongEndereco: function(){
        if(app.checkConnection()){
            var logradouro = $('#logradouro').val();
            var numero = $('#numero').val();
            var uf = $('#uf').val();
            var cidade = $('#cidade').val();
            var endereco = logradouro;
            if(numero != ""){
                endereco = endereco + ", " + numero;
            }
            endereco = endereco + " - " + cidade + "/" + uf;
            if(logradouro != "" && uf != "" && cidade != ""){

                app.loading(true, 'Localizando...');
                $.ajax({
                    url: urlWebServiceCarona + '/web_service.php?car=ca_markers&login=' + login + '&senha=' + senha + '&dados=' + endereco + '&callback=?',
                    dataType: 'json',
                    timeout: 10000,
                    error: function(jqXHR, textStatus, errorThrown) {
                        app.loading(false);
                        if(textStatus==="timeout") {
                            return app.semRespostaServidor();
                        }
                    },
                    success: function(data) {
                        app.loading(false);
                        if(data == null) {
                            app.loginError();
                        } else {
                            if((data.marker.endereco != "") && (data.marker.latitude != "") && (data.marker.longitude != "")){
                                $("#latitude").val(data.marker.latitude);
                                $("#latitude").attr('value', data.marker.latitude);
                                $("#longitude").val(data.marker.longitude);
                                $("#longitude").attr('value', data.marker.longitude);
                                $("#logradouro").val(data.marker.endereco);
                                $("#logradouro").attr('value', data.marker.endereco);
                                $("#enderecoCompleto").css('display','none');
                            } else {
                                $("#logradouro").focus();
                                $("#latitude").empty();
                                $("#longitude").empty();
                                navigator.notification.alert('Seu endereço não foi localizado. Você pode fazer seu cadastro pela versão desktop do Carona', function(){}, 'Erro', 'Tentar novamente');
                            }
                        }
                    }
                });
            }
        }
    },
    gravaDadosPessoais: function(){
        if(app.checkConnection()){
            var tipo = $('#dadosCarona input:radio[name=tipo]:checked').val();
            var fone = $('#dadosCarona #telefone').val();
            var ramal = $('#dadosCarona #ramal').val();
            var endereco = $('#dadosCarona #logradouro').val();
            var latitude = $('#dadosCarona #latitude').val();
            var longitude = $('#dadosCarona #longitude').val();
            var alocado = $('#dadosCarona #alocado').val();
            var horarioEntrada = $('#dadosCarona #horario_entrada').val();
            var horarioSaida = $('#dadosCarona #horario_saida').val();
            var observacoes = encodeURIComponent($('#dadosCarona #observacoes').val());
            var numVagas = $('#dadosCarona #num_vagas').val();
            var automovel = $('#dadosCarona #automovel').val();
            //valida tipo
            if(tipo == null) {
                navigator.notification.alert('Você deve escolher entre solicitar ou oferecer carona.', function(){}, 'Atenção', 'Ok');
                return false;
            }
            //valida telefone
            if((fone != "") && (!app.checkCampoTelefone(fone))) {
                navigator.notification.alert('Você deve informar um telefone válido ou não cadastrar nenhum.', function(){}, 'Atenção', 'Ok');
                return false;
            }
            //validacao endereço
            if(latitude != "" && longitude != "") {
                app.loading(true, 'Salvando...');
                $.ajax({
                    url: urlWebServiceCarona + '/web_service.php?car=ca_inscrito&login=' + login + '&senha=' + senha + '&dados=' + login + '_[x]_gravar_[x]_' + tipo + '_[x]_' + fone + '_[x]_' + ramal + '_[x]_' + endereco + '_[x]_' + latitude + '_[x]_' + longitude + '_[x]_' + horarioEntrada + '_[x]_' + horarioSaida + '_[x]_' + observacoes + '_[x]_' + numVagas + '_[x]_' + automovel + '_[x]_' + alocado + '&callback=?',
                    dataType: 'json',
                    timeout: 10000,
                    error: function(jqXHR, textStatus, errorThrown) {
                        app.loading(false);
                        if(textStatus==="timeout") {
                            return app.semRespostaServidor();
                        }
                    },
                    success: function(data) {
                        if(data == null) {
                            app.loginError();
                        } else {
                            app.loading(false);
                            //seta cidade padrão do user
                            localStorage.setItem('alocado', alocado);
                            cidadeAtual = alocado;
                            app.abreCarona(null, false, null);
                        }
                    }
                });
            } else {
                navigator.notification.alert('Digite o endereço e clique em Salvar endereço e só depois no botão SALVAR.', function(){}, 'Atenção', 'Ok');
            }
        }
    },
    gravaDescadastroCarona: function(){
        if(app.checkConnection()){
            app.loading(true, 'Desativando perfil...');
            $.ajax({
                url: urlWebServiceCarona + '/web_service.php?car=ca_inscrito&login=' + login + '&senha=' + senha + '&dados=' + login + '_[x]_desabilitar&callback=?',
                dataType: 'json',
                timeout: tempoRespostaLimite,
                error: function(jqXHR, textStatus, errorThrown) {
                    app.loading(false);
                    if(textStatus==="timeout") {
                        return app.semRespostaServidor();
                    }
                },
                success: function(data) {
                    app.loading(false);
                    if(data != null){
                        app.abreCarona(null, false, null);
                    } else {
                        return app.loginError();
                    }
                }
            });
        }
    },
    informaLotacao: function(){
        if(app.checkConnection()){
            if($('#btnLotacao').hasClass('lotado')){
                app.loading(true, 'Liberando...');
                $.ajax({
                    url: urlWebServiceCarona + '/web_service.php?car=ca_lotacao&login=' + login + '&senha=' + senha + '&callback=?',
                    dataType: 'json',
                    timeout: tempoRespostaLimite,
                    error: function(jqXHR, textStatus, errorThrown) {
                        app.loading(false);
                        if(textStatus==="timeout") {
                            return app.semRespostaServidor();
                        }
                    },
                    success: function(data) {
                        app.loading(false);
                        if((data != null) && (data.lotacao.lotado === '0')){
                            $('#btnLotacao').removeClass('lotado');
                            app.abreCarona(null, false, null);
                        } else {
                            return app.loginError();
                        }
                    }
                });
            } else {
                app.loading(true, 'Informando lotação...');
                $.ajax({
                    url: urlWebServiceCarona + '/web_service.php?car=ca_lotacao&login=' + login + '&senha=' + senha + '&callback=?',
                    dataType: 'json',
                    timeout: tempoRespostaLimite,
                    error: function(jqXHR, textStatus, errorThrown) {
                        app.loading(false);
                        if(textStatus==="timeout") {
                            return app.semRespostaServidor();
                        }
                    },
                    success: function(data) {
                        app.loading(false);
                        if((data != null) && (data.lotacao.lotado === '1')){
                            $('#btnLotacao').addClass('lotado');
                            app.abreCarona(null, false, null);
                        } else {
                            return app.loginError();
                        }
                    }
                });                
            }
        }
    },
    informaConseguiCarona: function(){
        if(app.checkConnection()){
            if($('#btnConseguiCarona').hasClass('consegui')){
                app.loading(true, 'Informando que não tem carona...');
                $.ajax({
                    url: urlWebServiceCarona + '/web_service.php?car=ca_consegui_carona&login=' + login + '&senha=' + senha + '&callback=?',
                    dataType: 'json',
                    timeout: tempoRespostaLimite,
                    error: function(jqXHR, textStatus, errorThrown) {
                        app.loading(false);
                        if(textStatus==="timeout") {
                            return app.semRespostaServidor();
                        }
                    },
                    success: function(data) {
                        app.loading(false);
                        if((data != null) && (data.consegui_carona.consegui === '0')){
                            $('#btnConseguiCarona').removeClass('consegui');
                            app.abreCarona(null, false, null);
                        } else {
                            return app.loginError();
                        }
                    }
                });
            } else {
                app.loading(true, 'Informando que conseguiu carona...');
                $.ajax({
                    url: urlWebServiceCarona + '/web_service.php?car=ca_consegui_carona&login=' + login + '&senha=' + senha + '&callback=?',
                    dataType: 'json',
                    timeout: tempoRespostaLimite,
                    error: function(jqXHR, textStatus, errorThrown) {
                        app.loading(false);
                        if(textStatus==="timeout") {
                            return app.semRespostaServidor();
                        }
                    },
                    success: function(data) {
                        app.loading(false);
                        if((data != null) && (data.consegui_carona.consegui === '1')){
                            $('#btnConseguiCarona').addClass('consegui');
                            app.abreCarona(null, false, null);
                        } else {
                            return app.loginError();
                        }
                    }
                });                
            }
        }
    },
    abreManualRS: function(){
        if(app.checkConnection()){
            app.loading(true, 'Carregando...');
            $.ajax({
                url: urlWebServiceSoftnews + '/web_service.php?car=sn_login&login=' + login + '&senha=' + senha + '&callback=?',
                dataType: 'json',
                timeout: tempoRespostaLimite,
                error: function(jqXHR, textStatus, errorThrown) {
                    app.loading(false);
                    if(textStatus==="timeout") {
                        return app.semRespostaServidor();
                    }
                },
                success: function(data) {
                    app.loading(false);
                    if((data != null) && (data.login.liberado === 'true')){
                        $.mobile.changePage("#manual", { changeHash: true });
                    } else {
                        return app.loginError();
                    }
                }
            }); 
        }
    },
    ManualRSParte: function(idParte){
        $('.ui-responsive-panel').panel("close");
        $.mobile.silentScroll($('#' + idParte).offset().top-100);
    },
    confereVersaoEditorialSoftnews: function(){
        //busca destaques Softnews
        $.ajax({
            url: urlWebServiceSoftnews + '/web_service.php?car=sn_edicao&login=' + login + '&senha=' + senha + '&dados=idEditorial&callback=?',
            dataType: 'json',
            timeout: tempoRespostaLimite,
            success: function(data) {
                if(data != null) {
                    var idEditorialAtual = data.editorial.id;
                    var idEditorialAtualInApp = sessionStorage.getItem('idEditorial');
                    if(idEditorialAtual != idEditorialAtualInApp){
                        $("#btnRefreshSoftnewsDisable").css('display','none');
                        $("#btnRefreshSoftnews").css('display','block');
                    } else {
                        $("#btnRefreshSoftnewsDisable").css('display','block');
                        $("#btnRefreshSoftnews").css('display','none');
                    }                    
                }
            }
        }); 
    },
    abreSoftnews: function(forceRefresh){
        if(app.checkConnection()){
            app.loading(true, 'Carregando...');
            var idEditorial = "";
            var idTagEditorial = "";
            var iniciaGlider = false;
            //só faz requisição se ainda não tiver sido feita
            if(($("#ulDestaquesSoftnews > li").size() < 2) || (forceRefresh == true)) {
                //limpa ul
                $('#ulDestaquesSoftnews').remove();
                $('<ul>').prependTo('#softnews .slider').addClass('slides').attr('id','ulDestaquesSoftnews');
                //busca destaques Softnews
                $.ajax({
                    url: urlWebServiceSoftnews + '/web_service.php?car=sn_edicao&login=' + login + '&senha=' + senha + '&callback=?',
                    dataType: 'json',
                    timeout: tempoRespostaLimite,
                    error: function(jqXHR, textStatus, errorThrown) {
                        app.loading(false);
                        if(textStatus==="timeout") {
                            return app.semRespostaServidor();
                        }
                    },
                    success: function(data) {
                        if(data == null) {
                            app.loginError();
                        } else {
                            idEditorial = data.editorial.id;
                            sessionStorage.setItem('idEditorial', idEditorial);
                            idTagEditorial = data.editorial.tag;
                            //lendo todo Json destaques
                            if(data.destaques.destaque != null){
                                iniciaGlider = true;
                                for (i = 0; i < data.destaques.destaque.length; i++) {
                                    //se for 2 elemento insere editorial, pois o bug no glider deixa ele correto
                                    if(i == 1) {
                                        //editorial
                                        $('#ulDestaquesSoftnews').append(
                                        "<li class='slide'>" +   
                                        "<a href='#Noticia' onclick=\"app.carregaNoticia('" + data.editorial.id + "')\">" +
                                        "<span style='width: " + (app.getDocWidth()-16) + "px;'>" + data.editorial.titulo.replace(/\u00c3\u00a0/g,'\u00e0') + "</span>" +
                                        "<img src='" + data.editorial.imagem + "' width='" + app.getDocWidth() + "px' height='250px'>" +
                                        "</a>" +
                                        "</li>"
                                        );
                                    }

                                    $('#ulDestaquesSoftnews').append(
                                    "<li class='slide'>" +   
                                    "<a href='#Noticia' onclick=\"app.carregaNoticia('" + data.destaques.destaque[i].id + "')\">" +
                                    "<span style='width: " + (app.getDocWidth()-16) + "px;'>" + data.destaques.destaque[i].titulo.replace(/\u00c3\u00a0/g,'\u00e0') + "</span>" +
                                    "<img src='" + data.destaques.destaque[i].imagem + "' width='" + app.getDocWidth() + "px' height='250px'>" +
                                    "</a>" +
                                    "</li>"
                                    );
                                }
                            //coloca apenas editorial    
                            } else {
                                //editorial
                                $('#ulDestaquesSoftnews').append(
                                "<li class='slide'>" +   
                                "<a href='#Noticia' onclick=\"app.carregaNoticia('" + data.editorial.id + "')\">" +
                                "<span style='width: " + (app.getDocWidth()-16) + "px;'>" + data.editorial.titulo.replace(/\u00c3\u00a0/g,'\u00e0') + "</span>" +
                                "<img src='" + data.editorial.imagem + "' width='" + app.getDocWidth() + "px' height='250px'>" +
                                "</a>" +
                                "</li>"
                                );
                            }

                            $.mobile.changePage("#softnews", { changeHash: true });
                            if(iniciaGlider == true){
                                $('#ulDestaquesSoftnews').glide();
                            }
                            app.loading(false);
                            app.carregaNoticiasEditorial(idEditorial, idTagEditorial, forceRefresh);
                        }
                    }
                });             
            } else {
                $.mobile.changePage("#softnews", { changeHash: true });
                app.carregaNoticiasEditorial(idEditorial, idTagEditorial, forceRefresh);
                //se já está carregado, confere se não há outra atualização (em segundo plano)
                app.confereVersaoEditorialSoftnews();
            }
        }
    },
    abreCategSoftnews: function(){
        $.mobile.changePage("#softnewsCategoria", { changeHash: true });
    },
    abreNoticiaSoftnews: function(){
        $.mobile.changePage("#softnewsNoticia", { changeHash: true });
    },
    carregaNoticiasEditorial: function(idEditorial, idTagEditorial, forceRefresh){
        if(($("#ulNoticiasEditorialSoftnews > li").size() < 2) || (forceRefresh == true)) {
            if(app.checkConnection()){
                $("#ulNoticiasEditorialSoftnews").empty();
                app.loading(true, 'Carregando...');
                $.ajax({
                    url: urlWebServiceSoftnews + '/web_service.php?car=sn_noticias_tagueadas&login=' + login + '&senha=' + senha + '&dados=' + idEditorial + '_[x]_' + idTagEditorial + '&callback=?',
                    dataType: 'json',
                    timeout: tempoRespostaLimite,
                    error: function(jqXHR, textStatus, errorThrown) {
                        app.loading(false);
                        if(textStatus==="timeout") {
                            return app.semRespostaServidor();
                        }
                    },
                    success: function(data) {
                        if(data == null) {
                            app.loginError();
                        } else {
                            //lendo todo Json
                            if(data.artigo != null){
                                for (i = 0; i < data.artigo.length; i++) {
                                    if(arrayIdsNoticias.indexOf(data.artigo[i].id) == "-1") {
                                        $('#ulNoticiasEditorialSoftnews').append(
                                        "<li data-icon='false'>" +        
                                        "<a href='#Noticia' onclick=\"app.carregaNoticia('" + data.artigo[i].id + "')\">" +
                                        "<h2 style='color: #000038 !important;'>" + data.artigo[i].titulo.replace(/\u00c3\u00a0/g,'\u00e0') + "</h2>" +
                                        "<p>" + he.decode(data.artigo[i].resumo.replace(/\u00c3\u00a0/g,'\u00e0')) + "</p>" +
                                        "<p class='ui-li-aside'><strong>" + data.artigo[i].categoria + " | " + data.artigo[i].data + "</strong></p>" +
                                        "</a>" +
                                        "</li>"
                                        );
                                    }
                                }
                            }
                            $('#softnews #ulNoticiasEditorialSoftnews').listview("refresh");
                            app.confereVersaoEditorialSoftnews();
                            app.loading(false);
                    }
                }
                });
            }
        }
        app.carregaCategorias(forceRefresh);
    },
    carregaCategorias: function(forceRefresh){  
        //sÃ³ faz requisiÃ§Ã£o se ainda nÃ£o tiver sido feita
        if(($("#ulCatsSoftnews > li").size() < 2) || (forceRefresh == true)) {

            if(app.checkConnection()){
                $("#ulCatsSoftnews").empty();
                app.loading(true, 'Carregando...');

                //busca categorias Softnews
                $.ajax({
                    url: urlWebServiceSoftnews + '/web_service.php?car=sn_lista_categorias&login=' + login + '&senha=' + senha + '&callback=?',
                    dataType: 'json',
                    timeout: tempoRespostaLimite,
                    error: function(jqXHR, textStatus, errorThrown) {
                        app.loading(false);
                        if(textStatus==="timeout") {
                            return app.semRespostaServidor();
                        }
                    },
                    success: function(data){
                        if(data == null) {
                            app.loginError();
                        } else {
                            $('#menuSoftnews #ulCatsSoftnews').append("<li data-icon='false'><a href='#' onclick=\"$.mobile.changePage('#softnews', { changeHash: true }); $('.ui-responsive-panel').panel('close');\">Home Softnews</a></li>");
                            //$('#menuSoftnews #ulCatsSoftnews').append("<li data-icon='false'><a href='#' onclick=\"app.carregaUltimasNoticiasGerais()\">Últimas Notícias</a></li>");
                            //lendo todo Json
                            for (i = 0; i < data.categoria.length; i++) {
                                $('#menuSoftnews #ulCatsSoftnews').append("<li data-icon='false'><a href='#' onclick=\"app.carregaUltimasNoticias('" + data.categoria[i].id + "', '" + data.categoria[i].abreviacao + "'); $('.ui-responsive-panel').panel('close');\">" + data.categoria[i].nome + "</a></li>");
                            }
                            $('#menuSoftnews #ulCatsSoftnews').listview("refresh");
                            app.loading(false);
                        }
                    }
                });  
            }
        }
    },
    carregaUltimasNoticiasGerais: function() {
        if(app.checkConnection()){
            app.loading(true, 'Carregando...');

            $('#softnewsCategoria #maisNoticias').css('display','none');

            var quantidadeNoticias = 10;
            var limparUl = true;

            $.ajax({
                url: urlWebServiceSoftnews + '/web_service.php?car=sn_noticias_gerais&login=' + login + '&senha=' + senha + '&dados=' + quantidadeNoticias + '&callback=?',
                dataType: 'json',
                timeout: tempoRespostaLimite,
                error: function(jqXHR, textStatus, errorThrown) {
                    app.loading(false);
                    if(textStatus==="timeout") {
                        return app.semRespostaServidor();
                    }
                },
                success: function(data) {
                    if(data == null) {
                        app.loginError();
                    } else {
                        if(limparUl == true){
                            $("#ulNoticiasCategoria").empty();
                        }
                        //lendo todo Json
                        if(data.artigo != null){
                            for (i = 0; i < data.artigo.length; i++) {
                                if(arrayIdsNoticias.indexOf(data.artigo[i].id) == "-1") {
                                    $('#ulNoticiasCategoria').append(
                                    "<li data-icon='false'>" +        
                                    "<a href='#Noticia' onclick=\"app.carregaNoticia('" + data.artigo[i].id + "')\">" +
                                    "<h2 style='color: #000038 !important;'>" + data.artigo[i].titulo.replace(/\u00c3\u00a0/g,'\u00e0') + "</h2>" +
                                    "<p>" + he.decode(data.artigo[i].resumo.replace(/\u00c3\u00a0/g,'\u00e0')) + "</p>" +
                                    "<p class='ui-li-aside'><strong>" + data.artigo[i].categoria + " | " + data.artigo[i].data + "</strong></p>" +
                                    "</a>" +
                                    "</li>"
                                    );
                                }
                            }
                        }
                        $("#softnewsCategoria #header > h1").html("Últimas Notícias");
                        app.abreCategSoftnews();
                        $('#softnewsCategoria #ulCatsSoftnews').listview("refresh");
                        $('#ulNoticiasCategoria').listview("refresh");
                        $('.ui-responsive-panel').panel("close");
                        app.loading(false);
                        //confere se não há outra atualização de edição (em segundo plano)
                        app.confereVersaoEditorialSoftnews();
                }
            }
            });
        }
    },
    carregaUltimasNoticias: function(idCategoria, nomeCategoria, ateId){
        if(app.checkConnection()){
            app.loading(true, 'Carregando...');

            //$('#softnewsCategoria #maisNoticias').css('display','none');

            var quantidadeNoticias = 10;
            var limparUl = false;
            if(ateId == null) {
                ateId = 0;
                arrayIdsNoticias = [];
                limparUl = true;
            }

            $.ajax({
                url: urlWebServiceSoftnews + '/web_service.php?car=sn_noticias_categorizadas&login=' + login + '&senha=' + senha + '&dados=' + ateId + '_[x]_'  + quantidadeNoticias + '_[x]_' + idCategoria + '&callback=?',
                dataType: 'json',
                timeout: 10000,
                error: function(jqXHR, textStatus, errorThrown) {
                    app.loading(false);
                    if(textStatus==="timeout") {
                        return app.semRespostaServidor();
                    }
                },
                success: function(data) {
                    if(data != null) {
                        var ultimoId = 0;
                        if(limparUl == true){
                            $("#ulNoticiasCategoria").empty();
                        }
                        //lendo todo Json
                        if(data.artigo != null){
                            for (i = 0; i < data.artigo.length; i++) {
                                if(arrayIdsNoticias.indexOf(data.artigo[i].id) == "-1") {
                                    $('#ulNoticiasCategoria').append(
                                    "<li data-icon='false'>" +        
                                    "<a href='#Noticia' onclick=\"app.carregaNoticia('" + data.artigo[i].id + "')\">" +
                                    "<h2 style='color: #000038 !important;'>" + data.artigo[i].titulo.replace(/\u00c3\u00a0/g,'\u00e0') + "</h2>" +
                                    "<p>" + he.decode(data.artigo[i].resumo.replace(/\u00c3\u00a0/g,'\u00e0')) + "</p>" +
                                    "<p class='ui-li-aside'><strong>" + data.artigo[i].data + "</strong></p>" +
                                    "</a>" +
                                    "</li>"
                                    );
                                    ultimoId = data.artigo[i].id; 
                                    arrayIdsNoticias[arrayIdsNoticias.length] = data.artigo[i].id;
                                }
                            }
                            //se veio menos que o solicitado
                            if(data.artigo.length >= quantidadeNoticias) {
                                $('#softnewsCategoria #maisNoticias').css('display','block');
                                $('#softnewsCategoria #maisNoticias').attr('onclick', "app.carregaUltimasNoticias('" + idCategoria + "', '" + nomeCategoria + "', '" + ultimoId + "')");
                            } else {
                                $('#softnewsCategoria #maisNoticias').css('display','none');
                            }
                        } else {
                            $('#softnewsCategoria #maisNoticias').css('display','none');
                        }

                        $("#softnewsCategoria .header > h1").html(nomeCategoria);
                        app.abreCategSoftnews();
                        $('#softnewsCategoria #ulCatsSoftnews').listview("refresh");
                        $('#ulNoticiasCategoria').listview("refresh");
                        $('.ui-responsive-panel').panel("close");
                        app.loading(false);
                        //confere se não há outra atualização de edição (em segundo plano)
                        app.confereVersaoEditorialSoftnews();
                    }
                }
            });  
        }
    },
    carregaNoticia: function(idNoticia) {
        if(app.checkConnection()){
            app.loading(true, 'Carregando...');

            $('#softnewsNoticia #dados_noticia').empty();
            $('#softnewsNoticia #titulo_noticia').empty();
            $('#softnewsNoticia #conteudo_noticia').empty();
            $('#softnewsNoticia #curtir').empty();
            $('#softnewsNoticia #comentar').empty();

            $.ajax({
                url: urlWebServiceSoftnews + '/web_service.php?car=sn_noticia&login=' + login + '&senha=' + senha + '&dados=' + idNoticia + '&callback=?',
                dataType: 'json',
                timeout: 10000,
                error: function(jqXHR, textStatus, errorThrown) {
                    app.loading(false);
                    if(textStatus==="timeout") {
                        return app.semRespostaServidor();
                    }
                },
                success: function(data) {
                    if(data == null) {
                        app.loginError();
                    } else {
                        $('#softnewsNoticia #dados_noticia').html(data.artigo.data + " em: " + data.artigo.categoria);
                        $('#softnewsNoticia #titulo_noticia').html(data.artigo.titulo.replace(/\u00c3\u00a0/g,'\u00e0'));
                        if(data.artigo.texto == "") {
                            $('#softnewsNoticia #conteudo_noticia').empty();
                        } else {
                            $('#softnewsNoticia #conteudo_noticia').html(he.decode(data.artigo.texto.replace(/\u00c3\u00a0/g,'\u00e0')));
                        }
                        $('#toCurtir').attr('onclick','app.curtirNoticia(' + idNoticia + ')');
                        $('#toCurtir').removeClass("active");
                        $('#toComentarios').removeClass("active");
                        $('#softnewsNoticia #curtir').html(data.artigo.curtidas);
                        $('#toComentarios').attr('onclick','app.carregaComentarios(' + idNoticia + ')');
                        $('#softnewsNoticia #comentar').html(data.artigo.comentarios);
                        //var urlCompartilhar = 'http://www.softnews.softplan.com.br/?p=' + idNoticia;
                        //$('#compFacebook').attr('href','http://www.facebook.com/sharer.php?u=' + urlCompartilhar);
                        //$('#compTwitter').attr('href','https://twitter.com/intent/tweet?original_referer=' + urlCompartilhar + '&source=tweetbutton&text=' + data.artigo.titulo + '&url=' + urlCompartilhar);
                        //alteraFonte();
                        app.abreNoticiaSoftnews();
                        $('#softnewsNoticia #ulCatsSoftnews').listview("refresh");
                        app.loading(false);
                        //confere se não há outra atualização de edição (em segundo plano)
                        app.confereVersaoEditorialSoftnews();
                    }
                }
            });
        }
    },
    carregaNavegador: function(elem, link, target){
        if(app.checkConnection()){
            $(elem).attr("target", "");
            if(link != "#"){
                window.open(encodeURI(link), target, 'location=yes');
                //window.plugins.ChildBrowser.showWebPage(encodeURI(link), { showLocationBar: true });
            }
        }
    },
    curtirNoticia: function(idNoticia) {
        if(app.checkConnection()){
            app.loading(true, 'Curtindo...');

            $.ajax({
                url: urlWebServiceSoftnews + '/web_service.php?car=sn_noticia&login=' + login + '&senha=' + senha + '&dados=' + idNoticia + '_[x]_curtir&callback=?',
                dataType: 'json',
                timeout: 10000,
                error: function(jqXHR, textStatus, errorThrown) {
                    app.loading(false);
                    if(textStatus==="timeout") {
                        return app.semRespostaServidor();
                    }
                },
                success: function(data) {
                    if(data == null) {
                        app.loginError();
                    } else {
                        //lendo todo Json
                        if(data.curtida != null){
                            $('#softnewsNoticia #curtir').empty();
                            $('#softnewsNoticia #curtir').html(data.curtida.num);
                            $('#toCurtir').addClass("active");
                            $('#toCurtir').removeAttr("onclick");
                        }
                        app.loading(false);
                    }
                }
            });
        }
    },
    carregaComentarios: function(idNoticia) {
        if(app.checkConnection()){
            app.loading(true, 'Carregando...');

            $('#comentarios #ulComentariosSoftnews').empty();

            $.ajax({
                url: urlWebServiceSoftnews + '/web_service.php?car=sn_comentarios&login=' + login + '&senha=' + senha + '&dados=' + idNoticia + '&callback=?',
                dataType: 'json',
                timeout: 10000,
                error: function(jqXHR, textStatus, errorThrown) {
                    app.loading(false);
                    if(textStatus==="timeout") {
                        return app.semRespostaServidor();
                    }
                },
                success: function(data) {
                    if(data == null) {
                        app.loginError();
                    } else {
                        //lendo todo Json
                        if(data.comentario != null){
                            if(data.comentario.length == null) {
                                $('#comentarios #ulComentariosSoftnews').append("<li data-role='list-divider'>" + data.comentario.autor + " (" + data.comentario.data + ")</li>");
                                $('#comentarios #ulComentariosSoftnews').append("<li><p style='margin: 0px !important; white-space: normal !important;'>" + data.comentario.texto.replace(/\u00c3\u00a0/g,'\u00e0') + "</p></li>");
                            } else {
                                for (i = 0; i < data.comentario.length; i++) {
                                    $('#comentarios #ulComentariosSoftnews').append("<li data-role='list-divider'>" + data.comentario[i].autor + " (" + data.comentario[i].data + ")</li>");
                                    $('#comentarios #ulComentariosSoftnews').append("<li><p style='margin: 0px !important; white-space: normal !important;'>" + data.comentario[i].texto.replace(/\u00c3\u00a0/g,'\u00e0') + "</p></li>");
                                }
                            }
                        } else {
                            $('#comentarios #ulComentariosSoftnews').append("<li><p>Nenhum comentário.</p></li>");
                        }
                        $('#softnewsNoticia #ulComentariosSoftnews').listview("refresh");
                        $('#enviarComent').attr('onclick','app.enviarComentario(' + idNoticia + ')');
                        $('#comentarios').popup("open");
                        app.loading(false);
                    }
                }
            });
        }
    },
    enviarComentario: function(idNoticia){
        if(app.checkConnection()){
            app.loading(true, 'Enviando para validação...');

            var comentario = encodeURIComponent($("#textareaComentario").val());

            if(comentario != "") {

                $.ajax({
                    url: urlWebServiceSoftnews + '/web_service.php?car=sn_comentarios&login=' + login + '&senha=' + senha + '&dados=' + idNoticia + '_[x]_' + comentario + '&callback=?',
                    dataType: 'json',
                    timeout: 10000,
                    error: function(jqXHR, textStatus, errorThrown) {
                        app.loading(false);
                        if(textStatus==="timeout") {
                            return app.semRespostaServidor();
                        }
                    },
                    success: function(data) {
                        if(data == null) {
                            app.loginError();
                        } else {
                            $('#comentarios').popup("close");
                            $("#textareaComentario").val("");
                            $('#toComentarios').addClass("active");
                            app.loading(false);
                            navigator.notification.alert('Seu comentário foi para validação.', function(){}, 'Obrigado', 'Ok');
                        }
                    }
                });

            } else {
                app.loading(false);
                navigator.notification.alert('É preciso digitar seu comentário antes de enviá-lo.', function(){}, 'Atenção', 'Ok');
            }
        }
    },
    confereVersaoMural: function(){
        $.ajax({
            url: urlWebServiceSoftnews + '/web_service.php?car=snm_edicao&login=' + login + '&senha=' + senha + '&callback=?',
            dataType: 'json',
            timeout: tempoRespostaLimite,
            success: function(data) {
                if(data != null) {
                    var idUltimoAnuncioAtual = data.ultimo_anuncio.id;
                    if(arrayIdsAnuncios.indexOf(idUltimoAnuncioAtual) == "-1") {
                        $("#btnRefreshMuralDisable").css({display: 'none'});
                        $("#btnRefreshMural").css({display: 'block', height: '42px'});
                    } else {
                        $("#btnRefreshMuralDisable").css({display: 'block', height: '42px'});
                        $("#btnRefreshMural").css({display: 'none'});
                    }                    
                }
            }
        }); 
    },
    confereVersaoMeuMural: function(){
        $.ajax({
            url: urlWebServiceSoftnews + '/web_service.php?car=snm_edicao&login=' + login + '&senha=' + senha + '&dados=meusAnuncios&callback=?',
            dataType: 'json',
            timeout: tempoRespostaLimite,
            success: function(data) {
                if(data != null) {
                    var idUltimoAnuncioAtual = data.ultimo_anuncio.id;
                    if((idUltimoAnuncioAtual != "") && (arrayIdsMeusAnuncios.indexOf(idUltimoAnuncioAtual) == "-1")) {
                        $("#btnRefreshMeuMuralDisable").css('display','none');
                        $("#btnRefreshMeuMural").css('display','block');
                    } else {
                        $("#btnRefreshMeuMuralDisable").css('display','block');
                        $("#btnRefreshMeuMural").css('display','none');
                    }                    
                }
            }
        }); 
    },
    abreMural: function(forceRefresh, ateId){
        if(app.checkConnection()){
            app.loading(true, 'Carregando...');
            //só faz requisição se ainda não tiver sido feita
            if(($("#ulMural > li").size() < 1) || (forceRefresh == true)) {
                $.mobile.changePage("#mural", { changeHash: true });
                app.carregaUltimosAnuncios();
            } else {
                $.mobile.changePage("#mural", { changeHash: true });
                app.loading(false);
                app.confereVersaoMural();
            }
        }
    },
    buscarMural: function(termo){
        if(termo == "") {
            $('#inputSearchMural').blur();
            ultimaPesquisa = "";
            app.loading(true, 'Limpando filtro...');
            app.abreMural(true, 0);
        } else if ((termo != "") && (termo != ultimaPesquisa)){ 
            ultimaPesquisa = $.trim(termo);
            app.loading(true, 'Filtrando...');
            clearTimeout(timerMural);
            timerMural = setTimeout(function validate(){
                app.abreMural(true, 0);
                app.loading(false);
            },1000);
        }
    },
    carregaUltimosAnuncios: function(ateId){
        if(app.checkConnection()){
            app.loading(true, 'Carregando...');
            
            $('#mural #maisAnuncios').css('display','none');

            var quantidadeAnuncios = 10;
            var limparUl = false;
            if(ateId == null) {
                ateId = 0;
                arrayIdsAnuncios = [];
                limparUl = true;
            }

            $.ajax({
                url: urlWebServiceSoftnews + '/web_service.php?car=snm_anuncios&login=' + login + '&senha=' + senha + '&dados=' + ateId + '_[x]_'  + quantidadeAnuncios + '_[x]_' + ultimaPesquisa + '&callback=?',
                dataType: 'json',
                timeout: tempoRespostaLimite,
                error: function(jqXHR, textStatus, errorThrown) {
                    app.loading(false);
                    if(textStatus==="timeout") {
                        return app.semRespostaServidor();
                    }
                },
                success: function(data) {
                    if(data == null) {
                        app.loginError();
                    } else {
                        var ultimoId = 0;
                        if(limparUl == true){
                            $("#ulMural").empty();
                        }
                        //lendo todo Json
                        if(data.anuncio != null){
                            if(data.anuncio.length != null) {
                                for (i = 0; i < data.anuncio.length; i++) {
                                    if(arrayIdsAnuncios.indexOf(data.anuncio[i].id) == "-1") {
                                        var html = "<li data-icon='false'>";        
                                        html += "<a href='#Anuncio' onclick=\"app.carregaAnuncio('" + data.anuncio[i].id + "')\">";
                                        html += "<h2 style='color: #000038 !important;'>" + data.anuncio[i].titulo.replace(/\u00c3\u00a0/g,'\u00e0') + "</h2>";
                                        html += "<p class='ui-li-aside'><strong>" + data.anuncio[i].categoria + " | ";
                                        if(data.anuncio[i].data_edicao !== data.anuncio[i].data_publicacao) {
                                            html += "Editado: " + data.anuncio[i].data_edicao;
                                        } else {
                                            html += data.anuncio[i].data_publicacao;
                                        }
                                        html += "</strong></p>";
                                        html += "</a>";
                                        html += "</li>";
                                        $('#ulMural').append(html);
                                        ultimoId = data.anuncio[i].id;
                                        arrayIdsAnuncios[arrayIdsAnuncios.length] = data.anuncio[i].id;
                                    }
                                }
                            } else {
                                var html = "<li data-icon='false'>";        
                                html += "<a href='#Anuncio' onclick=\"app.carregaAnuncio('" + data.anuncio.id + "')\">";
                                html += "<h2 style='color: #000038 !important;'>" + data.anuncio.titulo.replace(/\u00c3\u00a0/g,'\u00e0') + "</h2>";
                                html += "<p class='ui-li-aside'><strong>" + data.anuncio.categoria + " | ";
                                if(data.anuncio.data_edicao !== data.anuncio.data_publicacao) {
                                    html += "Editado: " + data.anuncio.data_edicao;
                                } else {
                                    html += data.anuncio.data_publicacao;
                                }
                                html += "</strong></p>";
                                html += "</a>";
                                html += "</li>";
                                $('#ulMural').append(html);
                                ultimoId = data.anuncio.id;
                                arrayIdsAnuncios[arrayIdsAnuncios.length] = data.anuncio.id;
                            }
                            //se veio menos que o solicitado
                            if(data.anuncio.length >= quantidadeAnuncios) {
                                $('#mural #maisAnuncios').css('display','block');
                                $('#mural #maisAnuncios').attr('onclick', "app.carregaUltimosAnuncios('" + ultimoId + "')");
                            } else {
                                $('#mural #maisAnuncios').css('display','none');
                            }
                        } else {
                            $('#mural #maisAnuncios').css('display','none');
                        }
                        $('#mural #ulMural').listview("refresh");
                        if(ultimaPesquisa === "") {
                            app.confereVersaoMural();
                        }
                        app.loading(false);
                    }
                }
            });
        }
    },
    carregaAnuncio: function(idAnuncio, paraEdicao) {
        if(app.checkConnection()){
            app.loading(true, 'Carregando...');
            
            $.ajax({
                url: urlWebServiceSoftnews + '/web_service.php?car=snm_anuncio&login=' + login + '&senha=' + senha + '&dados=' + idAnuncio + '&callback=?',
                dataType: 'json',
                timeout: 10000,
                error: function(jqXHR, textStatus, errorThrown) {
                    app.loading(false);
                    if(textStatus==="timeout") {
                        return app.semRespostaServidor();
                    }
                },
                success: function(data) {
                    if(data == null) {
                        app.loginError();
                    } else {
                        //se não for para edição é para mostrar anúncio
                        if(paraEdicao != true) {
                            
                            var iniciaGliderMural = false;
                            $('#muralAnuncio .slider').attr('style','');
                            $('#muralAnuncio #ulFotosAnuncio').remove();
                            $('<ul>').prependTo('#muralAnuncio .slider').addClass('slides').attr('id','ulFotosAnuncio');

                            $('#muralAnuncio #dados_anuncio').empty();
                            $('#muralAnuncio #titulo_anuncio').empty();
                            $('#muralAnuncio #conteudo_anuncio').empty();
                            $('#muralAnuncio #dados_anunciante').empty();
                            
                            if(data.anuncio.fotos.foto != null) {
                                var qtdFotos = Object.keys(data.anuncio.fotos.foto).length;
                                if(qtdFotos > 1) {
                                    iniciaGliderMural = true;
                                    for (i = 0; i < qtdFotos; i++) {
                                        $('#ulFotosAnuncio').append(
                                        "<li class='slide'>" + 
                                        "<img src='" + data.anuncio.fotos.foto[i].imagem + "' width='" + app.getDocWidth() + "px' height='250px'>" +
                                        "</li>"
                                        );
                                    }
                                } else {
                                    $('#muralAnuncio .slider').css('padding-bottom','0px');
                                    $('#ulFotosAnuncio').append(
                                    "<li class='slide'>" +   
                                    "<img src='" + data.anuncio.fotos.foto.imagem + "' width='" + app.getDocWidth() + "px' height='250px'>" +
                                    "</li>"
                                    );
                                }
                            } else {
                                $('#muralAnuncio .slider').css('display','none');
                            }
                            var htmlDados = "";
                            if(data.anuncio.data_edicao !== data.anuncio.data_publicacao) {
                                htmlDados += "Editado: " + data.anuncio.data_edicao;
                            } else {
                                htmlDados += "Publicado: " + data.anuncio.data_publicacao;
                            }
                            $('#muralAnuncio #dados_anuncio').html(htmlDados + " em: " + data.anuncio.categoria);
                            $('#muralAnuncio #titulo_anuncio').html(data.anuncio.titulo.replace(/\u00c3\u00a0/g,'\u00e0'));
                            if(data.anuncio.texto == "") {
                                $('#muralAnuncio #conteudo_anuncio').empty();
                            } else {
                                $('#muralAnuncio #conteudo_anuncio').html(he.decode(data.anuncio.texto.replace(/\u00c3\u00a0/g,'\u00e0').replace(/\n/g,'<br/>')));
                            }
                            $('#muralAnuncio #dados_anunciante').html("\r\nAutor: " + data.anuncio.nome_anunciante + "<br/>" + data.anuncio.email_anunciante + "<br/> Ramal: " + data.anuncio.ramal_anunciante);
                            $('#muralAnuncio #enviaEmail').attr('href','mailto:' + data.anuncio.email_anunciante);
                            $.mobile.changePage("#muralAnuncio", { changeHash: true });
                            if(iniciaGliderMural == true){
                                $('#ulFotosAnuncio').glide();
                            }
                            app.loading(false);
                            //confere se não há outra atualização de edição (em segundo plano)
                            if(ultimaPesquisa === "") {
                                app.confereVersaoMural();
                            }
                        
                        //se for para editar o anúncio
                        } else {
                            
                            var radios = $('#cadastroAnuncio input#'+ data.anuncio.categoria_slug).prop('checked', true);
                            radios.checkboxradio("refresh");
                            
                            $("#cadastroAnuncio #ramal").val(data.anuncio.ramal_anunciante);
                            $("#cadastroAnuncio #titulo").val(data.anuncio.titulo.replace(/\u00c3\u00a0/g,'\u00e0'));
                            $("#cadastroAnuncio #detalhes").val(he.decode(data.anuncio.texto.replace(/\u00c3\u00a0/g,'\u00e0')));
                            $("#cadastroAnuncio #detalhes").height( $("#cadastroAnuncio #detalhes")[0].scrollHeight );
                            
                            if(data.anuncio.fotos.foto != null) {
                                var qtdFotos = Object.keys(data.anuncio.fotos.foto).length;
                                if(qtdFotos > 1) {
                                    for (i = 0; i < qtdFotos; i++) {
                                        var aux = i+1;
                                        $('#cadastroAnuncio #FotoCadastrada' + aux + ' img').attr('src',  data.anuncio.fotos.foto[i].imagem);
                                        $('#cadastroAnuncio #FotoCadastrada' + aux).css('display','block');
                                        $('#cadastroAnuncio #inputFoto' + aux).css('display','none');
                                    }
                                } else {
                                    $('#cadastroAnuncio #FotoCadastrada1 img').attr('src',  data.anuncio.fotos.foto.imagem);
                                    $('#cadastroAnuncio #FotoCadastrada1').css('display','block');
                                    $('#cadastroAnuncio #inputFoto1').css('display','none');
                                }
                            }
                            
                            $.mobile.changePage("#cadastroAnuncio", { changeHash: true });
                            app.loading(false);
                            
                        }
                    }
                }
            });
        }
    },
    carregaMeusAnuncios: function(forceRefresh){  
        //sÃ³ faz requisiÃ§Ã£o se ainda nÃ£o tiver sido feita
        if(($("#ulMeusAnunciosMural > li").size() < 1) || (forceRefresh == true)) {
            if(app.checkConnection()){
                app.loading(true, 'Carregando...');
                $("#ulMeusAnunciosMural").empty();

                arrayIdsMeusAnuncios = [];

                //busca categorias Softnews
                $.ajax({
                    url: urlWebServiceSoftnews + '/web_service.php?car=snm_meus_anuncios&login=' + login + '&senha=' + senha + '&callback=?',
                    dataType: 'json',
                    timeout: tempoRespostaLimite,
                    error: function(jqXHR, textStatus, errorThrown) {
                        app.loading(false);
                        if(textStatus==="timeout") {
                            return app.semRespostaServidor();
                        }
                    },
                    success: function(data){
                        if(data == null) {
                            app.loginError();
                        } else {
                            //lendo todo Json
                            if(data.anuncio != null){
                                $("#semAnuncios").css('display','none');
                                if(data.anuncio.length != null) {
                                    for (i = 0; i < data.anuncio.length; i++) {
                                        if(arrayIdsMeusAnuncios.indexOf(data.anuncio[i].id) == "-1") {
                                            var html = "<li data-icon='false'>";        
                                            html += "<a href='#Anuncio' onclick=\"app.carregaAnuncio('" + data.anuncio[i].id + "')\">";
                                            html += "<h2 style='color: #000038 !important;'>" + data.anuncio[i].titulo.replace(/\u00c3\u00a0/g,'\u00e0') + "</h2>";
                                            html += "<p class='ui-li-aside'><strong>" + data.anuncio[i].categoria + " | ";
                                            if(data.anuncio[i].data_edicao !== data.anuncio[i].data_publicacao) {
                                                html += "Editado: " + data.anuncio[i].data_edicao;
                                            } else {
                                                html += data.anuncio[i].data_publicacao;
                                            }
                                            html += "</strong></p>";
                                            html += "</a>";
                                            html += "<a href='#AnuncioEditar' onclick=\"app.adicionarEditarAnuncio('" + data.anuncio[i].id + "')\">Editar</a>";
                                            html += "</li>";
                                            $('#ulMeusAnunciosMural').append(html);
                                            arrayIdsMeusAnuncios[arrayIdsMeusAnuncios.length] = data.anuncio[i].id;
                                        }
                                    }
                                } else {
                                    if(arrayIdsMeusAnuncios.indexOf(data.anuncio.id) == "-1") {
                                        var html = "<li data-icon='false'>";        
                                        html += "<a href='#Anuncio' onclick=\"app.carregaAnuncio('" + data.anuncio.id + "')\">";
                                        html += "<h2 style='color: #000038 !important;'>" + data.anuncio.titulo.replace(/\u00c3\u00a0/g,'\u00e0') + "</h2>";
                                        html += "<p class='ui-li-aside'><strong>" + data.anuncio.categoria + " | ";
                                        if(data.anuncio.data_edicao !== data.anuncio.data_publicacao) {
                                            html += "Editado: " + data.anuncio.data_edicao;
                                        } else {
                                            html += data.anuncio.data_publicacao;
                                        }
                                        html += "</strong></p>";
                                        html += "</a>";
                                        html += "<a href='#AnuncioEditar' onclick=\"app.adicionarEditarAnuncio('" + data.anuncio.id + "')\">Editar</a>";
                                        html += "</li>";
                                        $('#ulMeusAnunciosMural').append(html);
                                        arrayIdsMeusAnuncios[arrayIdsMeusAnuncios.length] = data.anuncio.id;
                                    }
                                }
                            //se não tiver anúncio    
                            } else {
                                $("#semAnuncios").css('display','block');                                
                            }
                            
                            $.mobile.changePage("#muralMeusAnuncios", { changeHash: true });
                            $('#muralMeusAnuncios #ulMeusAnunciosMural').listview("refresh");
                            app.loading(false);
                            //confere se realmente atualizou
                            if(forceRefresh == true) {
                                app.confereVersaoMeuMural();
                            }
                        }
                    }
                });  
            }
        } else {
            $.mobile.changePage("#muralMeusAnuncios", { changeHash: true });
            app.loading(false);
            //confere se realmente atualizou
            app.confereVersaoMeuMural();
        }
    },    
    adicionarEditarAnuncio: function(idAnuncio){
        if(app.checkConnection()){
            app.loading(true, 'Carregando...');
            //mascaras
            $(".maskRamal").mask("9999");
            app.zeraFormAnuncio();
            
            var primeiroNome = nomeUser.split(' ');
            $('#cadastroAnuncio #nomePerfil').html(primeiroNome[0]);
            $.mobile.changePage("#cadastroAnuncio", { changeHash: true });
            app.loading(false);
            if(idAnuncio != null) {
                $('#btnSalvarAnuncio').attr('onclick','app.gravaDadosAnuncio(' + idAnuncio + ');');
                $('#btnExcluirAnuncio').attr('onclick','app.excluiAnuncio(' + idAnuncio + ');');
                $('#btnExcluirAnuncio').css('display','block');
                app.carregaAnuncio(idAnuncio, true);
            }
        }
    },
    selecionarImg: function(elem){
        if(elem.val() != "") {
            var foto = elem.get(0).files[0];
            elem.parent().find('span').html(foto.name);
        } else {
            elem.parent().find('span').html('Selecine foto');
        }
    },
    alterarImg: function(elem, elemParaAlterar){
        elem.parent().css('display','none');
        $('#' + elemParaAlterar).css('display','block');
    },
    gravaDadosAnuncio: function(idAnuncio) {
        if(app.checkConnection()){
            
            var ramal = $('#cadastroAnuncio #ramal').val();
            var categoria = $('#cadastroAnuncio input:radio[name=categoria]:checked').val();
            var titulo = $('#cadastroAnuncio #titulo').val();
            var detalhes = encodeURIComponent($('#cadastroAnuncio #detalhes').val());
            //valida categoria
            if(categoria == null){
                navigator.notification.alert('Você deve escolher uma categoria para anunciar.', function(){}, 'Atenção', 'Ok');
                return false;
            }
            if(titulo == ""){
                navigator.notification.alert('Você deve informar um título para o anúncio.', function(){}, 'Atenção', 'Ok');
                return false;
            }
            
            app.loading(true, 'Salvando anúncio...');
                        
            $.ajax({
                url: urlWebServiceSoftnews + '/web_service.php?car=snm_anuncio&login=' + login + '&senha=' + senha + '&dados=' + idAnuncio + '_[x]_salvar_[x]_' + ramal + '_[x]_' + categoria + '_[x]_' + titulo + '_[x]_' + detalhes + '&callback=?',
                dataType: 'json',
                timeout: 10000,
                error: function(jqXHR, textStatus, errorThrown) {
                    app.loading(false);
                    if(textStatus==="timeout") {
                        return app.semRespostaServidor();
                    }
                },
                success: function(data) {
                    if(data == null) {
                        app.loginError();
                    } else {
                        //lendo todo Json
                        app.loading(false);
                        if(data.anuncio != null){
                            idAnuncio = data.anuncio.id;
                            if(idAnuncio != "") {
                                var comFoto = false;
                                for(var i=1; i<=4; i++){
                                    if($('input#foto' + i).val() != "") {
                                        comFoto = true;
                                        app.gravaFotosAnuncio(idAnuncio, i);
                                    }
                                }
                                if(comFoto == false){
                                    app.zeraFormAnuncio();
                                    app.carregaMeusAnuncios(true);
                                }
                            }
                        }
                    }
                }
            });
        }
    },
    gravaFotosAnuncio: function(idAnuncio, numElem){
        var foto = $('#foto' + numElem)[0].files[0];
        var reader = new FileReader();  
        var xhr = new XMLHttpRequest();
        this.xhr = xhr;
        
        xhr.onreadystatechange = function(){
            if(xhr.readyState === 1){
                app.loading(true, 'Salvando imagem...');
                $('#inputFoto' + numElem + ' span').removeClass('enviado').addClass('enviando').html('Enviando...');
            }
            if(xhr.readyState === 4){
                $('#inputFoto' + numElem + ' span').removeClass('enviando').addClass('enviado').html('Enviado');
                //se não tiver mais nenhum como enviando
                if($('span span.enviando').length == 0){
                    app.loading(false);
                    app.zeraFormAnuncio();
                    app.carregaMeusAnuncios(true);
                }
            }
        }
        
        xhr.open("POST", urlWebServiceSoftnews + '/web_service.php?car=snm_anuncio_foto&login=' + login + '&senha=' + senha + '&dados=' + idAnuncio + '_[x]_' + numElem);
        xhr.overrideMimeType('text/plain; charset=x-user-defined-binary');
        reader.onload = function(evt) {
            xhr.send(evt.target.result);
        };
        reader.readAsDataURL(foto);
    },
    excluiAnuncio: function(idAnuncio) {
        if(app.checkConnection()){
            app.loading(true, 'Excluindo anúncio...');
            $.ajax({
                url: urlWebServiceSoftnews + '/web_service.php?car=snm_anuncio&login=' + login + '&senha=' + senha + '&dados=' + idAnuncio + '_[x]_excluir&callback=?',
                dataType: 'json',
                timeout: tempoRespostaLimite,
                success: function(data) {
                    app.loading(false);
                    app.zeraFormAnuncio();
                    app.carregaMeusAnuncios(true);
                }
            });
        }
    },
    zeraFormAnuncio: function(){
        //zerar form       
        $('#cadastroAnuncio #ramal').val("");
        $("#cadastroAnuncio input[name='categoria']").prop('checked', false);
        $("#cadastroAnuncio .ui-radio-on").removeClass('ui-radio-on').addClass('ui-radio-off');
        $('#cadastroAnuncio #titulo').val("");
        $('#cadastroAnuncio #detalhes').val("");
        $("#cadastroAnuncio #detalhes").css("height","auto");
        $('#cadastroAnuncio .fotoCadastrada').css("display","none");
        $('#cadastroAnuncio .fileinput-button').css("display","block");
        for(var i=1; i<=4; i++){
            $('input#foto' + i).parent().find('span').html('Selecine foto ' + i);
            $('input#foto' + i).val("");
        }
        $('#btnSalvarAnuncio').attr('onclick','app.gravaDadosAnuncio(0);');
        $('#btnExcluirAnuncio').attr('onclick','app.excluiAnuncio(0);');
        $('#btnExcluirAnuncio').css('display','none');

    },
    politicaDeUsoMural: function(){
        $.mobile.changePage("#politicaMural", { role: 'dialog', changeHash: true });
    },
    abreCallback: function(area, forceRefresh){
        app.loading(true, 'Carregando...');
        
        //antes verifica se é habilitado para fazer ligações - DESABILITADO POR ENQUANTO
//        if((area != "Configuração") && (habilitadoParaLigacoes === false)){
//            if((fazLigacao == null) && (numTelefone == null)) {
//                app.abreCallback('Configuração');
//                return false;
//            } else {
//                app.verificaNumeroNaCentral();
//            }
//        }
        
        if((fazLigacao == "true") || (fazLigacao == true)) {
            $('#menuCallback #linkAgendaCallback').css('display','block');
        } else {
            $('#menuCallback #linkAgendaCallback').css('display','none');
        }
        
        if(area == "CRT") {
            //só faz requisição se ainda não tiver sido feita
            if(($("#ulRamaisCallback > li").size() < 2) || (forceRefresh == true)) {
                if(app.checkConnection()){
                    //limpa ul
                    $('#ulRamaisCallback').empty();
                    //busca ramais
                    $.ajax({
                        url: urlWebServiceCallback + '/crtContact',
                        dataType: 'json',
                        timeout: tempoRespostaLimite,
                        error: function(jqXHR, textStatus, errorThrown) {
                            app.loading(false);
                            if(textStatus==="timeout") {
                                return app.semRespostaServidor();
                            }
                        },
                        success: function(data) {
                            if(data == null) {
                                app.loginError();
                            } else {
                                //lendo todo Json ramais
                                for (i = 1; i < data.length; i++) {
                                    var nome = data[i].nome.toString().toUpperCase();
                                    var projeto = "não cadastrado";
                                    var ramal = "não cadastrado";
                                    var celular = "não cadastrado";
                                    var email = "não cadastrado";
                                    if(data[i].projeto){
                                        projeto = data[i].projeto.toString().toUpperCase();
                                    }
                                    if(data[i].numero){
                                        ramal = data[i].numero.toString();
                                    }
                                    if(data[i].celular){
                                        celular = data[i].celular.toString();
                                    }
                                    if(data[i].email){
                                        email = data[i].email.toString();
                                    }
                                    $('#ulRamaisCallback').append(
                                    "<li data-icon='false'>" +   
                                    "<a href='#Ramal' onclick=\"app.abreContatoCrt('" + nome + "', '" + projeto + "', '" + ramal + "', '" + celular + "', '" + email + "')\">" +
                                    "<h2 style='color: #000038 !important; width: 88% !important;'>" + nome + "</h2>" +
                                    "<p class='ui-li-aside'><strong>" + projeto + "</strong></p>" +
                                    "</a>" +
                                    "</li>"
                                    );
                                }

                                $.mobile.changePage("#callback-crt", { changeHash: true });
                                $('#callback-crt #ulRamaisCallback').listview("refresh");
                                app.loading(false);
                            }
                        }
                    });    
                }
            } else {
                $.mobile.changePage("#callback-crt", { changeHash: true });
                app.loading(false);
            }
        }
        
        if(area == "Configuração") {
            //mascaras
            $(".maskTelefone").mask("(99) 9999-9999?9");
            
            var radios = $('input:radio[name=fazLigacoes]');
            if((fazLigacao != null) && ((fazLigacao == "true") || (fazLigacao == true))){
                app.numTelefoneShow(true);
                radios.filter('[value=fazligacao]').prop('checked', true);
            } else if((fazLigacao != null) && ((fazLigacao == "false") || (fazLigacao == false))){
                app.numTelefoneShow(false);
                radios.filter('[value=naofazligacao]').prop('checked', true);
            }
            $('#callback-configs #numeroTelefone').val(numTelefone);
            
            $.mobile.changePage("#callback-configs", { changeHash: true });
            
            var primeiroNome = nomeUser.split(' ');
            $('#callback-configs #nomePerfil').html(primeiroNome[0]);
            
            app.loading(false);           
        }
    },
    numTelefoneShow: function(tipo){
        if(tipo == true){
            $('#inputNumTelefone').css('display','block');
        } else {
            $('#inputNumTelefone').css('display','none');
        }
    },
    gravaDadosConfigsCallback: function(){
        var valfazligacao = $('#callback-configs input:radio[name=fazLigacoes]:checked').val();
        var valnumtelefone = $('#callback-configs #numeroTelefone').val();
        //valida form
        if(valfazligacao === undefined){
            navigator.notification.alert('Você deve informar se o aparelho faz ligações ou não.', function(){}, 'Atenção', 'Ok');
        } else if((valfazligacao === "fazligacao") && (valnumtelefone === "")){
            navigator.notification.alert('Você deve informar o número do telefone para continuar.', function(){}, 'Atenção', 'Ok');
            return false;
        } else if((valfazligacao === "fazligacao") && (valnumtelefone != "") && (!app.checkCampoTelefone(valnumtelefone))){ 
            navigator.notification.alert('Você deve informar o número válido do telefone para continuar.', function(){}, 'Atenção', 'Ok');
            return false;
        } else if((valfazligacao === "fazligacao") && (valnumtelefone != "") && (app.checkCampoTelefone(valnumtelefone))){
            localStorage.setItem('fazLigacao', true);
            fazLigacao = true;
            localStorage.setItem('numTelefone', valnumtelefone);
            numTelefone = valnumtelefone;
        } else if(valfazligacao === "naofazligacao") {
            localStorage.setItem('fazLigacao', false);
            fazLigacao = false;
        }
        //continua
        app.verificaNumeroNaCentral();
        app.abreCallback('CRT', false);
    },
    verificaNumeroNaCentral: function(){
        if((numTelefone != null) && (numTelefone != "")){
            var numeroEditado = numTelefone.split("");
            numeroEditado = numeroEditado[1]+numeroEditado[2]+numeroEditado[5]+numeroEditado[6]+numeroEditado[7]+numeroEditado[8]+numeroEditado[10]+numeroEditado[11]+numeroEditado[12]+numeroEditado[13];
            if(numeroEditado[14]){
                numeroEditado += numeroEditado[14];
            }
            if(app.checkConnection()){
                $.ajax({
                    url: urlWebServiceCallback + '/verifyPhoneNumber?phoneNumber=' + numeroEditado,
                    dataType: 'json',
                    async: true,
                    timeout: tempoRespostaLimite,
                    error: function(jqXHR, textStatus, errorThrown) {
                        habilitadoParaLigacoes = false;
                    },
                    success: function(data) {
                        if(data != null) {
                            //retorna true ou false
                            habilitadoParaLigacoes = data;
                        }
                    }
                });    
            }
        }
    },
    filtrarCrt: function(termo){
        if(termo == "") {
            $('#inputSearchCallback').blur();
            app.loading(true, 'Limpando filtro...');
        } else if ((termo != "") && (termo != ultimoFiltro)){ 
            ultimoFiltro = termo;
            app.loading(true, 'Filtrando...');
        }
        clearTimeout(timerCrt);
        timerCrt = setTimeout(function validate(){
            var search = $.trim(termo);
            var regex = new RegExp(search,'gi');
            $('#ulRamaisCallback li').find('h2').each(function() {
                if($(this).text().match(regex) !== null) {
                    $(this).parent().show();
                } else {
                    $(this).parent().hide();
                }
            });
            app.loading(false);
        },1000);
    },
    correCrt: function(letra){
        $('#ulRamaisCallback li').find('h2').each(function() {
            var arrayTexto = $(this).text().split("");
            if(arrayTexto[0] == letra) {
                $.mobile.silentScroll($(this).offset().top-150);
                return false;
            }
        });
    },
    abreContatoCrt: function(nome, projeto, ramal, celular, email){
        $.mobile.changePage("#dadosCallbackRamal", { changeHash: true });
        $("#dadosCallbackRamal #dados h2").html(nome);
        $("#dadosCallbackRamal #dados span").html(projeto);
        $('#dadosCallbackRamal #ulOpcoes').empty();
        var ramalEditado = ramal.split('/');
        ramalEditado = ramalEditado[0];
        $('#dadosCallbackRamal #ulOpcoes').append(
        "<li>" +   
        "<a class='ui-btn ui-btn-icon-right ui-icon-phone' href='#Ramal'>" +
        "<h2 style='color: #000038 !important;'>" + ramal + "</h2>" +
        "<p class='ui-li-aside'><strong>RAMAL</strong></p>" +
        "</a>" +
        "</li>"
        );
        $('#dadosCallbackRamal #ulOpcoes').append(
        "<li>" +   
        "<a class='ui-btn ui-btn-icon-right ui-icon-phone' href='tel:" + celular + "'>" +
        "<h2 style='color: #000038 !important;'>" + celular + "</h2>" +
        "<p class='ui-li-aside'><strong>CELULAR</strong></p>" +
        "</a>" +
        "</li>"
        );
        var emailEditado = email.toLowerCase();
        //emailEditado = emailEditado[0].toLowerCase() + "@softplan.com.br";
        $('#dadosCallbackRamal #ulOpcoes').append(
        "<li>" +   
        "<a class='ui-btn ui-btn-icon-right ui-icon-mail' href='mailto:" + emailEditado + "'>" +
        "<h2 style='color: #000038 !important;'>" + emailEditado + "</h2>" +
        "<p class='ui-li-aside'><strong>E-MAIL</strong></p>" +
        "</a>" +
        "</li>"
        );
        $('#dadosCallbackRamal #ulOpcoes').listview("refresh");
        if((habilitadoParaLigacoes === true) && ((fazLigacao == true) || (fazLigacao == "true"))){
            $('#callbac_desabilitado').css('display','none');
        } else {
            $('#callbac_desabilitado').css('display','block');
        }
    },
    abreConfigs: function(){
        $.mobile.changePage("#configs", { changeHash: true });
        app.testaFalhasLogin();
    },
    fazerLogin: function(){
        if(app.checkConnection()){
            app.loading(true, 'Efetuando Login...');

            //login e senha
            if($("#login").val() !== "") {
                login = $("#login").val().split('@');
                login = login[0].toLowerCase();
            } else {
                login = localStorage.getItem('login');
            }

            if($("#senha").val() !== "") {
                senha = $("#senha").val();
                senha = senha.replace(/#/g, '[jogovelha]');                
                senha = senha.replace(/ /g, '[espaco]');
            } else {
                senha = localStorage.getItem('senha');
            }                

            if(login !== "" && senha !== "") {

                localStorage.setItem('login', login);
                localStorage.setItem('senha', senha);

                $("#login").val(login);
                $("#senha").val(senha);

                $.ajax({
                    url: urlWebServiceSoftnews + '/web_service.php?car=sn_login&login=' + login + '&senha=' + senha + '&callback=?',
                    dataType: 'json',
                    timeout: tempoRespostaLimite,
                    error: function(jqXHR, textStatus, errorThrown) {
                        app.loading(false);
                        if(textStatus==="timeout") {
                            return app.semRespostaServidor();
                        }
                    },
                    success: function(data) {
                        app.loading(false);
                        if((data != null) && (data.login.liberado === 'true')){
                            nomeUser = data.login.nome;
                            return app.loginOk();
                        } else {
                            return app.loginError();
                        }
                    },
                    statusCode: {
                        404: function(){
                            app.loading(false);
                            app.semRespostaServidor();
                        },
                        500: function() {
                            app.loading(false);
                            app.semRespostaServidor();
                        }
                    }
                });

            } else {
                return app.loginError();
            }
        }
    },
    loginOk: function(){
        
        $('#dados_incorretos').css("display","none");
        $('#btnLogout').css("display","block");
        localStorage.setItem('falhasLogin', 0);
        app.testaFalhasLogin();               
        app.abreMenuInicial();
        return true;
        
    },
    loginError: function(){
        
        app.loading(false);
        app.abreLogin();
        $('#dados_incorretos').css("display","block");
        $('#btnLogout').css("display","none");
        setTimeout(function(){
            localStorage.setItem('falhasLogin', parseFloat(localStorage.getItem('falhasLogin'))+parseFloat(1));
            localStorage.removeItem('login');
            localStorage.removeItem('senha');
            app.testaFalhasLogin();
        }, 3000);                
        return false;
        
    },
    fazerLogout: function(){
        
        login = "";
        senha = "";
        $('#login').val("");
        $('#senha').val("");
        $('#btnLogin').css("display","block");
        $('#btnLogout').css("display","none");
        localStorage.removeItem('login');
        localStorage.removeItem('senha');
        app.abreLogin();
        
    },
    testaFalhasLogin: function(){
        
        if(localStorage.getItem('falhasLogin') == null) {
            localStorage.setItem('falhasLogin', 0);
        }
        if(localStorage.getItem('falhasLogin') >= 2) {
            $('#falhas_login').css("display","block");
        } else {
            $('#falhas_login').css("display","none");
        }
        
    }
};
