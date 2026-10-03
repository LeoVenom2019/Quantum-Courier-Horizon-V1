!define QCH_PLAYSOUND_FLAGS 0x00020009

Var QchDialog
Var QchSceneControl
Var QchSceneBitmap
Var QchProgressBar
Var QchProgressText
Var QchMusicCheckbox
Var QchMotionCheckbox
Var QchMusicEnabled
Var QchReduceMotion
Var QchFrame

!macro QchExtractLaunchAssets
  InitPluginsDir
  SetOutPath $PLUGINSDIR
  File /oname=qch-launch-00.bmp "${PROJECT_DIR}\build\installer\sequence\launch-00.bmp"
  File /oname=qch-launch-01.bmp "${PROJECT_DIR}\build\installer\sequence\launch-01.bmp"
  File /oname=qch-launch-02.bmp "${PROJECT_DIR}\build\installer\sequence\launch-02.bmp"
  File /oname=qch-launch-03.bmp "${PROJECT_DIR}\build\installer\sequence\launch-03.bmp"
  File /oname=qch-launch-04.bmp "${PROJECT_DIR}\build\installer\sequence\launch-04.bmp"
  File /oname=qch-launch-05.bmp "${PROJECT_DIR}\build\installer\sequence\launch-05.bmp"
  File /oname=qch-launch-06.bmp "${PROJECT_DIR}\build\installer\sequence\launch-06.bmp"
  File /oname=qch-launch-07.bmp "${PROJECT_DIR}\build\installer\sequence\launch-07.bmp"
  File /oname=qch-launch-08.bmp "${PROJECT_DIR}\build\installer\sequence\launch-08.bmp"
  File /oname=qch-launch-09.bmp "${PROJECT_DIR}\build\installer\sequence\launch-09.bmp"
  File /oname=qch-launch-10.bmp "${PROJECT_DIR}\build\installer\sequence\launch-10.bmp"
  File /oname=qch-launch.wav "${PROJECT_DIR}\build\installer\sequence\launch-sequence.wav"
!macroend

!macro QchExtractReturnAssets
  InitPluginsDir
  SetOutPath $PLUGINSDIR
  File /oname=qch-return-00.bmp "${PROJECT_DIR}\build\installer\sequence\return-00.bmp"
  File /oname=qch-return-01.bmp "${PROJECT_DIR}\build\installer\sequence\return-01.bmp"
  File /oname=qch-return-02.bmp "${PROJECT_DIR}\build\installer\sequence\return-02.bmp"
  File /oname=qch-return-03.bmp "${PROJECT_DIR}\build\installer\sequence\return-03.bmp"
  File /oname=qch-return-04.bmp "${PROJECT_DIR}\build\installer\sequence\return-04.bmp"
  File /oname=qch-return-05.bmp "${PROJECT_DIR}\build\installer\sequence\return-05.bmp"
  File /oname=qch-return-06.bmp "${PROJECT_DIR}\build\installer\sequence\return-06.bmp"
  File /oname=qch-return-07.bmp "${PROJECT_DIR}\build\installer\sequence\return-07.bmp"
  File /oname=qch-return-08.bmp "${PROJECT_DIR}\build\installer\sequence\return-08.bmp"
  File /oname=qch-return-09.bmp "${PROJECT_DIR}\build\installer\sequence\return-09.bmp"
  File /oname=qch-return-10.bmp "${PROJECT_DIR}\build\installer\sequence\return-10.bmp"
  File /oname=qch-return.wav "${PROJECT_DIR}\build\installer\sequence\return-sequence.wav"
!macroend

!ifndef BUILD_UNINSTALLER

  !macro customInit
    !insertmacro QchExtractLaunchAssets
    StrCpy $QchMusicEnabled 1
    StrCpy $QchReduceMotion 0
    StrCpy $QchFrame -1
  !macroend

  !macro customWelcomePage
    Page custom QchWelcomeCreate QchWelcomeLeave
  !macroend

  !macro customPageAfterChangeDir
    Page custom QchLaunchCreate QchLaunchLeave
    !define MUI_PAGE_CUSTOMFUNCTION_SHOW QchInstallShow
    !define MUI_PAGE_CUSTOMFUNCTION_LEAVE QchInstallLeave
  !macroend

  !macro customFinishPage
    Page custom QchFinishCreate QchFinishLeave
  !macroend

  Function QchStopMusic
    System::Call 'winmm::PlaySoundW(i 0, i 0, i 0)'
  FunctionEnd

  Function QchStartMusic
    Call QchStopMusic
    System::Call 'winmm::PlaySoundW(w "$PLUGINSDIR\qch-launch.wav", i 0, i ${QCH_PLAYSOUND_FLAGS})'
  FunctionEnd

  Function QchSetLaunchFrame
    Exch $0
    StrCmp $0 $QchFrame qch_launch_frame_done
    StrCpy $QchFrame $0
    ${If} $QchSceneBitmap != 0
      ${NSD_FreeImage} $QchSceneBitmap
    ${EndIf}
    ${Switch} $0
      ${Case} 0
        StrCpy $1 "$PLUGINSDIR\qch-launch-00.bmp"
        ${Break}
      ${Case} 1
        StrCpy $1 "$PLUGINSDIR\qch-launch-01.bmp"
        ${Break}
      ${Case} 2
        StrCpy $1 "$PLUGINSDIR\qch-launch-02.bmp"
        ${Break}
      ${Case} 3
        StrCpy $1 "$PLUGINSDIR\qch-launch-03.bmp"
        ${Break}
      ${Case} 4
        StrCpy $1 "$PLUGINSDIR\qch-launch-04.bmp"
        ${Break}
      ${Case} 5
        StrCpy $1 "$PLUGINSDIR\qch-launch-05.bmp"
        ${Break}
      ${Case} 6
        StrCpy $1 "$PLUGINSDIR\qch-launch-06.bmp"
        ${Break}
      ${Case} 7
        StrCpy $1 "$PLUGINSDIR\qch-launch-07.bmp"
        ${Break}
      ${Case} 8
        StrCpy $1 "$PLUGINSDIR\qch-launch-08.bmp"
        ${Break}
      ${Case} 9
        StrCpy $1 "$PLUGINSDIR\qch-launch-09.bmp"
        ${Break}
      ${Default}
        StrCpy $1 "$PLUGINSDIR\qch-launch-10.bmp"
    ${EndSwitch}
    ${NSD_SetImage} $QchSceneControl $1 $QchSceneBitmap
    qch_launch_frame_done:
    Pop $0
  FunctionEnd

  Function QchWelcomeCreate
    nsDialogs::Create 1018
    Pop $QchDialog
    ${If} $QchDialog == error
      Abort
    ${EndIf}
    ${NSD_CreateBitmap} 0 0 100% 105u ""
    Pop $QchSceneControl
    ${NSD_SetImage} $QchSceneControl "$PLUGINSDIR\qch-launch-00.bmp" $QchSceneBitmap
    ${NSD_CreateLabel} 0 109u 100% 13u "LAUNCH SEQUENCE // QUANTUM COURIER HORIZON"
    Pop $0
    ${NSD_CreateLabel} 0 123u 100% 20u "Prepare a Atlas Courier. O assistente verificará o destino antes da decolagem."
    Pop $0
    GetDlgItem $0 $HWNDPARENT 1
    SendMessage $0 ${WM_SETTEXT} 0 "STR:CONFIGURAR MISSÃO"
    nsDialogs::Show
  FunctionEnd

  Function QchWelcomeLeave
  FunctionEnd

  Function QchLaunchCreate
    nsDialogs::Create 1018
    Pop $QchDialog
    ${If} $QchDialog == error
      Abort
    ${EndIf}
    ${NSD_CreateBitmap} 0 0 100% 105u ""
    Pop $QchSceneControl
    ${NSD_SetImage} $QchSceneControl "$PLUGINSDIR\qch-launch-00.bmp" $QchSceneBitmap
    ${NSD_CreateCheckbox} 0 108u 100% 12u "Ativar trilha sonora da sequência"
    Pop $QchMusicCheckbox
    ${NSD_Check} $QchMusicCheckbox
    ${NSD_CreateCheckbox} 0 122u 100% 12u "Reduzir animações (acessibilidade)"
    Pop $QchMotionCheckbox
    ${NSD_CreateLabel} 0 137u 100% 12u "Destino confirmado. Sistemas prontos para iniciar."
    Pop $0
    GetDlgItem $0 $HWNDPARENT 1
    SendMessage $0 ${WM_SETTEXT} 0 "STR:INICIAR SEQUÊNCIA DE INSTALAÇÃO"
    nsDialogs::Show
  FunctionEnd

  Function QchLaunchLeave
    ${NSD_GetState} $QchMusicCheckbox $QchMusicEnabled
    ${NSD_GetState} $QchMotionCheckbox $QchReduceMotion
    ${If} $QchMusicEnabled == ${BST_CHECKED}
      Call QchStartMusic
    ${EndIf}
  FunctionEnd

  Function QchInstallShow
    !insertmacro MUI_HEADER_TEXT "Launch Sequence" "Transferência orbital e calibração dos sistemas"
    StrCpy $QchFrame -1
    StrCpy $QchProgressBar $mui.InstFilesPage.ProgressBar
    StrCpy $QchProgressText $mui.InstFilesPage.Text
    System::Call 'user32::CreateWindowExW(i 0, w "STATIC", w "", i 0x5000000E, i 0, i 0, i 500, i 175, i $mui.InstFilesPage, i 0, i 0, i 0) i .r0'
    StrCpy $QchSceneControl $0
    System::Call 'user32::SetWindowPos(i $QchProgressText, i 0, i 16, i 181, i 468, i 18, i 0x0004)'
    System::Call 'user32::SetWindowPos(i $QchProgressBar, i 0, i 16, i 204, i 468, i 14, i 0x0004)'
    System::Call 'user32::SetWindowPos(i $mui.InstFilesPage.ShowLogButton, i 0, i 16, i 224, i 150, i 18, i 0x0004)'
    ShowWindow $mui.InstFilesPage.Log ${SW_HIDE}
    SendMessage $mui.InstFilesPage.ShowLogButton ${WM_SETTEXT} 0 "STR:Detalhes técnicos"
    Push 0
    Call QchSetLaunchFrame
    GetFunctionAddress $0 QchInstallTick
    nsDialogs::CreateTimer $0 160
  FunctionEnd

  Function QchInstallTick
    SendMessage $QchProgressBar 0x0408 0 0 $0
    IntOp $1 $0 / 10
    ${If} $QchReduceMotion == ${BST_CHECKED}
      ${If} $0 < 50
        StrCpy $1 0
      ${ElseIf} $0 < 100
        StrCpy $1 5
      ${Else}
        StrCpy $1 10
      ${EndIf}
    ${EndIf}
    Push $1
    Call QchSetLaunchFrame
    ${If} $0 < 15
      StrCpy $2 "Inicializando núcleo quântico"
    ${ElseIf} $0 < 35
      StrCpy $2 "Mapeando rotas e preparando recursos"
    ${ElseIf} $0 < 60
      StrCpy $2 "Atravessando o cinturão de asteroides"
    ${ElseIf} $0 < 82
      StrCpy $2 "Sincronizando telemetria da Horizon"
    ${ElseIf} $0 < 100
      StrCpy $2 "Estabilizando o portal de lançamento"
    ${Else}
      StrCpy $2 "Sinal Horizon estabelecido"
    ${EndIf}
    SendMessage $QchProgressText ${WM_SETTEXT} 0 "STR:$2  •  $0%"
  FunctionEnd

  Function QchInstallLeave
    GetFunctionAddress $0 QchInstallTick
    nsDialogs::KillTimer $0
    Push 10
    Call QchSetLaunchFrame
  FunctionEnd

  Function StartApp
    ExecShell "open" "$INSTDIR\${PRODUCT_FILENAME}.exe"
  FunctionEnd

  Function QchFinishCreate
    nsDialogs::Create 1018
    Pop $QchDialog
    ${If} $QchDialog == error
      Abort
    ${EndIf}
    ${NSD_CreateBitmap} 0 0 100% 105u ""
    Pop $QchSceneControl
    ${NSD_SetImage} $QchSceneControl "$PLUGINSDIR\qch-launch-10.bmp" $QchSceneBitmap
    ${NSD_CreateLabel} 0 109u 100% 14u "QUANTUM COURIER HORIZON PRONTO PARA LANÇAMENTO"
    Pop $0
    ${NSD_CreateLabel} 0 125u 100% 18u "A Atlas Courier atravessou o portal. Sua jornada pode começar."
    Pop $0
    GetDlgItem $0 $HWNDPARENT 1
    SendMessage $0 ${WM_SETTEXT} 0 "STR:INICIAR JORNADA"
    GetDlgItem $0 $HWNDPARENT 3
    ShowWindow $0 ${SW_HIDE}
    GetDlgItem $0 $HWNDPARENT 2
    ShowWindow $0 ${SW_HIDE}
    nsDialogs::Show
  FunctionEnd

  Function QchFinishLeave
    Call QchStopMusic
    Call StartApp
  FunctionEnd

  Function .onGUIEnd
    Call QchStopMusic
  FunctionEnd

!else

  !ifdef MUI_UNWELCOMEFINISHPAGE_BITMAP
    !undef MUI_UNWELCOMEFINISHPAGE_BITMAP
  !endif
  !define MUI_UNWELCOMEFINISHPAGE_BITMAP "${PROJECT_DIR}\build\installer\uninstallerSidebar.bmp"

  !macro customUnInit
    !insertmacro QchExtractReturnAssets
    StrCpy $QchMusicEnabled 1
    StrCpy $QchReduceMotion 0
    StrCpy $QchFrame -1
  !macroend

  !macro customUnWelcomePage
    UninstPage custom un.QchReturnCreate un.QchReturnLeave
    !define MUI_PAGE_CUSTOMFUNCTION_SHOW un.QchUninstallShow
    !define MUI_PAGE_CUSTOMFUNCTION_LEAVE un.QchUninstallLeave
  !macroend

  !macro customUninstallPage
    !define MUI_FINISHPAGE_TITLE "Obrigado por viajar conosco"
    !define MUI_FINISHPAGE_TEXT "A Atlas Courier concluiu a sequência de retorno.$\r$\n$\r$\nSeus dados de jornada foram preservados. Até o próximo horizonte."
  !macroend

  Function un.QchStopMusic
    System::Call 'winmm::PlaySoundW(i 0, i 0, i 0)'
  FunctionEnd

  Function un.QchStartMusic
    Call un.QchStopMusic
    System::Call 'winmm::PlaySoundW(w "$PLUGINSDIR\qch-return.wav", i 0, i ${QCH_PLAYSOUND_FLAGS})'
  FunctionEnd

  Function un.QchSetReturnFrame
    Exch $0
    StrCmp $0 $QchFrame qch_return_frame_done
    StrCpy $QchFrame $0
    ${If} $QchSceneBitmap != 0
      ${NSD_FreeImage} $QchSceneBitmap
    ${EndIf}
    ${Switch} $0
      ${Case} 0
        StrCpy $1 "$PLUGINSDIR\qch-return-00.bmp"
        ${Break}
      ${Case} 1
        StrCpy $1 "$PLUGINSDIR\qch-return-01.bmp"
        ${Break}
      ${Case} 2
        StrCpy $1 "$PLUGINSDIR\qch-return-02.bmp"
        ${Break}
      ${Case} 3
        StrCpy $1 "$PLUGINSDIR\qch-return-03.bmp"
        ${Break}
      ${Case} 4
        StrCpy $1 "$PLUGINSDIR\qch-return-04.bmp"
        ${Break}
      ${Case} 5
        StrCpy $1 "$PLUGINSDIR\qch-return-05.bmp"
        ${Break}
      ${Case} 6
        StrCpy $1 "$PLUGINSDIR\qch-return-06.bmp"
        ${Break}
      ${Case} 7
        StrCpy $1 "$PLUGINSDIR\qch-return-07.bmp"
        ${Break}
      ${Case} 8
        StrCpy $1 "$PLUGINSDIR\qch-return-08.bmp"
        ${Break}
      ${Case} 9
        StrCpy $1 "$PLUGINSDIR\qch-return-09.bmp"
        ${Break}
      ${Default}
        StrCpy $1 "$PLUGINSDIR\qch-return-10.bmp"
    ${EndSwitch}
    ${NSD_SetImage} $QchSceneControl $1 $QchSceneBitmap
    qch_return_frame_done:
    Pop $0
  FunctionEnd

  Function un.QchReturnCreate
    nsDialogs::Create 1018
    Pop $QchDialog
    ${If} $QchDialog == error
      Abort
    ${EndIf}
    ${NSD_CreateBitmap} 0 0 100% 105u ""
    Pop $QchSceneControl
    ${NSD_SetImage} $QchSceneControl "$PLUGINSDIR\qch-return-00.bmp" $QchSceneBitmap
    ${NSD_CreateCheckbox} 0 108u 100% 12u "Ativar trilha sonora de despedida"
    Pop $QchMusicCheckbox
    ${NSD_Check} $QchMusicCheckbox
    ${NSD_CreateCheckbox} 0 122u 100% 12u "Reduzir animações (acessibilidade)"
    Pop $QchMotionCheckbox
    ${NSD_CreateLabel} 0 137u 100% 13u "Os dados de jornada serão preservados para um futuro retorno."
    Pop $0
    GetDlgItem $0 $HWNDPARENT 1
    SendMessage $0 ${WM_SETTEXT} 0 "STR:INICIAR SEQUÊNCIA DE RETORNO"
    nsDialogs::Show
  FunctionEnd

  Function un.QchReturnLeave
    ${NSD_GetState} $QchMusicCheckbox $QchMusicEnabled
    ${NSD_GetState} $QchMotionCheckbox $QchReduceMotion
    ${If} $QchMusicEnabled == ${BST_CHECKED}
      Call un.QchStartMusic
    ${EndIf}
  FunctionEnd

  Function un.QchUninstallShow
    !insertmacro MUI_HEADER_TEXT "Return Sequence" "Preparando a Atlas Courier para o retorno"
    StrCpy $QchFrame -1
    StrCpy $QchProgressBar $mui.InstFilesPage.ProgressBar
    StrCpy $QchProgressText $mui.InstFilesPage.Text
    System::Call 'user32::CreateWindowExW(i 0, w "STATIC", w "", i 0x5000000E, i 0, i 0, i 500, i 175, i $mui.InstFilesPage, i 0, i 0, i 0) i .r0'
    StrCpy $QchSceneControl $0
    System::Call 'user32::SetWindowPos(i $QchProgressText, i 0, i 16, i 181, i 468, i 18, i 0x0004)'
    System::Call 'user32::SetWindowPos(i $QchProgressBar, i 0, i 16, i 204, i 468, i 14, i 0x0004)'
    System::Call 'user32::SetWindowPos(i $mui.InstFilesPage.ShowLogButton, i 0, i 16, i 224, i 150, i 18, i 0x0004)'
    ShowWindow $mui.InstFilesPage.Log ${SW_HIDE}
    SendMessage $mui.InstFilesPage.ShowLogButton ${WM_SETTEXT} 0 "STR:Detalhes técnicos"
    Push 0
    Call un.QchSetReturnFrame
    GetFunctionAddress $0 un.QchUninstallTick
    nsDialogs::CreateTimer $0 160
  FunctionEnd

  Function un.QchUninstallTick
    SendMessage $QchProgressBar 0x0408 0 0 $0
    IntOp $1 $0 / 10
    ${If} $QchReduceMotion == ${BST_CHECKED}
      ${If} $0 < 50
        StrCpy $1 0
      ${ElseIf} $0 < 100
        StrCpy $1 5
      ${Else}
        StrCpy $1 10
      ${EndIf}
    ${EndIf}
    Push $1
    Call un.QchSetReturnFrame
    ${If} $0 < 20
      StrCpy $2 "Recolhendo módulos da Horizon"
    ${ElseIf} $0 < 45
      StrCpy $2 "Desacoplando recursos locais"
    ${ElseIf} $0 < 70
      StrCpy $2 "Preservando os registros da jornada"
    ${ElseIf} $0 < 95
      StrCpy $2 "Traçando a rota de retorno"
    ${Else}
      StrCpy $2 "Retorno concluído. Obrigado, comandante"
    ${EndIf}
    SendMessage $QchProgressText ${WM_SETTEXT} 0 "STR:$2  •  $0%"
  FunctionEnd

  Function un.QchUninstallLeave
    GetFunctionAddress $0 un.QchUninstallTick
    nsDialogs::KillTimer $0
    Push 10
    Call un.QchSetReturnFrame
    Call un.QchStopMusic
  FunctionEnd

  Function un.onGUIEnd
    Call un.QchStopMusic
  FunctionEnd

!endif

!define MUI_ABORTWARNING
