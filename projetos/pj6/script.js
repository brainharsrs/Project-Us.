const inputTo = document.getElementById('inputTo');
const inputFrom = document.getElementById('inputFrom');
const inputDate = document.getElementById('inputDate');
const inputContent = document.getElementById('inputContent');
const charCounter = document.getElementById('charCounter');

const previewDate = document.getElementById('previewDate');
const previewTo = document.getElementById('previewTo');
const previewContent = document.getElementById('previewContent');
const previewFrom = document.querySelector('.signature');

const messageBox = document.getElementById('messageBox');

function getTodayInPortuguese() {
    return new Date().toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function updatePreview() {
    const toValue = inputTo.value.trim();
    const fromValue = inputFrom.value.trim();
    const dateValue = inputDate.value.trim() || getTodayInPortuguese();
    const contentValue = inputContent.value;

    const charCount = contentValue.length;
    charCounter.textContent = `${charCount}/800`;

    if (charCount > 700) {
        charCounter.className = 'char-counter danger';
    } else if (charCount > 500) {
        charCounter.className = 'char-counter warning';
    } else {
        charCounter.className = 'char-counter';
    }

    previewDate.textContent = dateValue;
    previewTo.textContent = toValue || 'Meu amor,';
    previewFrom.textContent = fromValue || '[Seu nome]';
    previewContent.textContent = contentValue;
}

function showMessage(text, type = 'info') {
    const typeClasses = {
        success: 'success',
        error: 'error',
        info: 'info'
    };

    messageBox.className = `message-box ${typeClasses[type]}`;
    messageBox.textContent = text;
    messageBox.style.display = 'block';

    setTimeout(() => {
        messageBox.style.display = 'none';
    }, 3000);
}

function generateFullText() {
    const date = previewDate.textContent;
    const to = inputTo.value.trim();
    const from = inputFrom.value.trim();
    const content = inputContent.value;

    const recipientLine = to || 'Meu amor,';
    const signatureLine = from ? `\nCom todo o meu amor,\n${from}` : '\nCom todo o meu amor,\n[Seu nome]';

    return `${date}\n\n${recipientLine}\n\n${content}${signatureLine}`;
}

function copyDocumentToClipboard() {
    const fullText = generateFullText();

    const textArea = document.createElement('textarea');
    textArea.value = fullText;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();

    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showMessage('Texto da carta copiado com sucesso.', 'success');
        } else {
            showMessage('Nao foi possivel copiar. Tente novamente.', 'error');
        }
    } catch (err) {
        showMessage('Erro ao copiar texto. Verifique as permissoes do navegador.', 'error');
        console.error('Falha ao copiar:', err);
    } finally {
        document.body.removeChild(textArea);
    }
}

async function exportAsPng() {
    showMessage('Gerando PNG... Aguarde um instante.', 'info');

    const tempPrintableArea = document.createElement('div');
    tempPrintableArea.className = 'printable-letter-area';
    tempPrintableArea.innerHTML = `
        <span class="heart-decoration heart-top-left">&#10084;</span>
        <span class="heart-decoration heart-bottom-right">&#10084;</span>
        <div class="letter-date">${previewDate.textContent}</div>
        <div class="letter-to">${previewTo.textContent}</div>
        <div class="letter-text">${previewContent.textContent}</div>
        <div class="letter-from">
            <p class="closing">Com todo o meu amor,</p>
            <p class="signature">${previewFrom.textContent}</p>
        </div>
    `;
    document.body.appendChild(tempPrintableArea);

    try {
        const canvas = await html2canvas(tempPrintableArea, {
            scale: 2,
            useCORS: true,
            backgroundColor: null
        });

        const image = canvas.toDataURL('image/png');
        const baseName = (inputTo.value.trim() || 'carta_de_amor')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-zA-Z0-9_-]/g, '_')
            .replace(/_+/g, '_')
            .toLowerCase();
        const filename = `${baseName}.png`;

        const a = document.createElement('a');
        a.href = image;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        showMessage(`Arquivo ${filename} baixado com sucesso.`, 'success');
    } catch (error) {
        console.error('Erro ao gerar PNG:', error);
        showMessage('Nao foi possivel gerar o PNG. Tente novamente.', 'error');
    } finally {
        document.body.removeChild(tempPrintableArea);
    }
}

window.onload = () => {
    const today = getTodayInPortuguese();
    inputDate.value = today;

    inputTo.value = 'Helena';
    inputFrom.value = 'Bryan';
    inputContent.value = 'Meu amor,\n\nDesde que voce apareceu, meus dias ficaram mais leves e mais bonitos. Cada risada nossa, cada detalhe e cada conversa viraram lembrancas que eu guardo com muito carinho.\n\nVoce me inspira, me acalma e me faz querer ser melhor todos os dias. Obrigado por ser essa pessoa tao especial.\n\nTe amo e quero viver muitos capitulos ao seu lado.';

    updatePreview();
};
