!include LogicLib.nsh
!include nsDialogs.nsh
!include MUI2.nsh

!ifndef MUI_INSTFILESYPAGE_INTERFACE
  !define MUI_INSTFILESYPAGE_INTERFACE
  Var mui.InstFilesPage
  Var mui.InstFilesPage.Text
  Var mui.InstFilesPage.ProgressBar
  Var mui.InstFilesPage.ShowLogButton
  Var mui.InstFilesPage.Log
!endif

!include "${__FILEDIR__}\installer-body.nsh"
