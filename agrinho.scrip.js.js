// ==========================================
// ESTADO INICIAL DO JOGO (VARIÁVEIS)
// ==========================================
let months = 1;              // Contador de meses
let money = 100;             // Moedas iniciais do jogador
let soilHealth = 100;        // Saúde do solo (0 a 100%)
let baseProduction = 10;     // Quantidade base de sacas produzidas
let carbonCredits = 0;       // [NOVO] Contador de Créditos de Carbono acumulados

// ==========================================
// REFERÊNCIAS DOS ELEMENTOS HTML (DOM)
// ==========================================
const monthsEl = document.getElementById('months');
const moneyEl = document.getElementById('money');
const productionEl = document.getElementById('production');
const soilTextEl = document.getElementById('soil-text');
const soilBarEl = document.getElementById('soil-bar');
const logEl = document.getElementById('log');

// Referências dos elementos visuais da fazenda (Adicionados aqui para organização)
const farmField = document.getElementById('farm-field');
const farmCrop = document.getElementById('farm-crop');

// ==========================================
// FUNÇÕES DE INTERFACE E CONTROLE
// ==========================================

// FUNÇÃO UNIFICADA: Atualiza todos os dados e elementos visuais que o jogador vê na tela
function updateUI() {
    // 1. Atualização dos textos básicos
    if (monthsEl) monthsEl.innerText = months;
    if (moneyEl) moneyEl.innerText = money;
    if (soilTextEl) soilTextEl.innerText = soilHealth + '%';
    if (soilBarEl) soilBarEl.style.width = soilHealth + '%';
    if (productionEl) productionEl.innerText = baseProduction;

    // 2. Alerta visual da barra de progresso do solo
    if (soilBarEl) {
        if (soilHealth < 40) {
            soilBarEl.className = "progress-bar soil-bad";
        } else {
            soilBarEl.className = "progress-bar soil-good";
        }
    }

    // 3. Lógica de aparência gráfica da plantação (Baseada na saúde do solo)
    if (farmCrop && farmField) {
        if (soilHealth >= 80) {
            // Solo Excelente: Planta grande, bonita e balançando
            farmCrop.style.fontSize = "4.5rem"; 
            farmCrop.className = "swaying";
            farmField.classList.remove('farm-soil-bad');
        } else if (soilHealth >= 50) {
            // Solo Moderado: Planta tamanho normal
            farmCrop.style.fontSize = "3rem";
            farmCrop.className = "";
            farmField.classList.remove('farm-soil-bad');
        } else if (soilHealth >= 20) {
            // Solo Ruim (Abaixo de 50%): Planta começa a encolher
            farmCrop.style.fontSize = "2rem";
            farmCrop.className = "";
            farmField.classList.add('farm-soil-bad'); // Fundo fica marrom/seco
        } else {
            // Solo Crítico (Abaixo de 20%): Planta brotinho e feia/murcha
            farmCrop.style.fontSize = "1.2rem";
            farmCrop.className = "";
            farmField.classList.add('farm-soil-bad');
        }
    }

    // 4. Condição de Derrota: Ficar sem dinheiro
    if (money <= 0) {
        log("<span class='danger-alert'>[FALÊNCIA] Seu dinheiro acabou! Game Over. Reiniciando...</span>");
        disableButtons();
        setTimeout(resetGame, 5000); // Reinicia após 5 segundos
    }
}

// Adiciona mensagens ao painel de acontecimentos (Log)
function log(message) {
    if (logEl) {
        logEl.innerHTML += `<div>${message}</div>`;
        logEl.scrollTop = logEl.scrollHeight; // Rola o scroll para baixo automaticamente
    }
}

// Desativa os botões quando o jogo acaba
function disableButtons() {
    const buttons = document.querySelectorAll('.choices-container button');
    buttons.forEach(btn => btn.disabled = true);
}

// Reseta o jogo para o estado inicial
function resetGame() {
    months = 1;
    money = 100;
    soilHealth = 100;
    baseProduction = 10;
    carbonCredits = 0; // Reseta os créditos
    if (logEl) logEl.innerHTML = "<div>[Mês 1] O jogo foi reiniciado! Tente uma nova estratégia.</div>";
    const buttons = document.querySelectorAll('.choices-container button');
    buttons.forEach(btn => btn.disabled = false);
    updateUI();
}

// ==========================================
// LÓGICA PRINCIPAL DE DECISÕES E EVENTOS
// ==========================================

function makeDecision(choice) {
    let currentProduction = baseProduction;
    let eventTriggered = false;

    // 1. SISTEMA DE EVENTOS CLIMÁTICOS / PRAGAS
    if (soilHealth < 50) {
        if (Math.random() > 0.5) {
            const eventType = Math.random() > 0.5 ? "Degradação por Pragas" : "Estresse Hídrico (Seca)";
            log(`<span class="danger-alert">[DESAFIO] Seu ecossistema enfraqueceu! Ocorreu ${eventType}.</span>`);
            currentProduction = Math.floor(currentProduction * 0.3); // Perda de 70%
            eventTriggered = true;
        }
    }

    // 2. PROCESSAMENTO DAS DECISÕES (Tema: AgroForte e Sustentável)
    if (choice === 'convencional') {
        let profit = Math.floor(currentProduction * 2.5); 
        if (eventTriggered) profit = Math.floor(profit * 0.3);
        
        money += profit;
        soilHealth = Math.max(0, soilHealth - 25); // Degrada muito
        
        if (productionEl) productionEl.innerText = eventTriggered ? `${currentProduction} (Prejudicada)` : currentProduction;
        log(`[Mês ${months}] 🚜 Manejo Convencional: Alta produção interna, mas houve compactação e perda de nutrientes do solo. (+ $${profit})`);
        
    } else if (choice === 'bioinsumos') {
        let profit = Math.floor(currentProduction * 1.9); 
        if (eventTriggered) profit = Math.floor(profit * 0.3);
        
        money += profit;
        soilHealth = Math.min(100, soilHealth + 12); // Recuperação boa
        
        // [NOVO] Acumula créditos se a saúde do solo estiver boa
        if (soilHealth > 50) {
            carbonCredits += 2;
        }

        if (productionEl) productionEl.innerText = currentProduction;
        log(`[Mês ${months}] 🌱 Bioinsumos Aplicados: Defensivos biológicos protegeram a lavoura e enriqueceram a microbiota do solo! (+ $${profit})`);
        
    } else if (choice === 'ilpf') {
        let profit = Math.floor(currentProduction * 1.0); 
        if (eventTriggered) profit = Math.floor(profit * 0.3);
        
        money += profit;
        soilHealth = Math.min(100, soilHealth + 35); // Excelente recuperação
        
        // [NOVO] ILPF retém muito carbono, gerando mais créditos se o solo estiver bem cuidado
        if (soilHealth > 60) {
            carbonCredits += 5;
        }

        if (productionEl) productionEl.innerText = currentProduction;
        log(`[Mês ${months}] 🌳 Sistema ILPF: Mudança de cultura e plantio direto. O solo está retendo mais água e nutrientes. (+ $${profit})`);
    }

    // EVOLUÇÃO SUSTENTÁVEL (A longo prazo, a tecnologia se paga)
    if (soilHealth > 80) {
        baseProduction += 1; // Aumenta a resiliência da fazenda
    }

    // Avanço de tempo antes das checagens periódicas
    let pastMonth = months;
    months++;

    // 3. [NOVO] VENDA SEMESTRAL DE CRÉDITOS DE CARBONO (A cada 6 meses)
    // Usamos pastMonth porque representa o mês que acabou de ser jogado
    if (pastMonth % 6 === 0) {
        if (carbonCredits > 0) {
            let carbonProfit = carbonCredits * 15; // Cada crédito vale $15 moedas
            money += carbonProfit;
            log(`<span style="color: #2e7d32; font-weight: bold;">💰 [MERCADO DE CARBONO] Semestre concluído! Você vendeu ${carbonCredits} Créditos de Carbono acumulados e faturou +$${carbonProfit} extras! Sustentabilidade dá lucro!</span>`);
            carbonCredits = 0; // Zera o estoque após a venda
        } else {
            log(`<span style="color: #757575;">ℹ️ [MERCADO DE CARBONO] Fim do semestre. Você não acumulou Créditos de Carbono pois utilizou manejo agressivo ou a saúde do solo estava baixa.</span>`);
        }
    }

    // 4. CUSTO TRIMESTRAL DE MANUTENÇÃO TECNOLÓGICA (A cada 3 meses)
    if (pastMonth % 3 === 0) {
        const maintenanceCost = 30;
        money -= maintenanceCost;
        log(`<span style="color: #ff5722;">[CUSTO TRIMESTRAL] Monitoramento por Satélite e Insumos Tecnológicos: -$${maintenanceCost}</span>`);
    }

    updateUI();
}

// Inicializa a interface assim que o script carrega
updateUI();
