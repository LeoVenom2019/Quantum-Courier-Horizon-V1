!macro customWelcomePage
  !define MUI_WELCOMEPAGE_TITLE "Bem-vindo ao Quantum Courier Horizon"
  !define MUI_WELCOMEPAGE_TEXT "Prepare-se para explorar novos horizontes.$\r$\n$\r$\nEste assistente instalará o Quantum Courier Horizon e configurará os atalhos necessários. Recomendamos fechar outros aplicativos antes de continuar."
  !insertmacro MUI_PAGE_WELCOME
!macroend

!define MUI_FINISHPAGE_TITLE "Instalação concluída"
!define MUI_FINISHPAGE_TEXT "Quantum Courier Horizon está pronto para jogar.$\r$\n$\r$\nClique em Concluir para encerrar o instalador."
!define MUI_ABORTWARNING
