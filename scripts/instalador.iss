; VC DistribuidorPro — Instalador Windows (Inno Setup)
; Compilar: npm run crear:setup

#define MyAppName "VC DistribuidorPro"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "RYV Frutas del Caribe"
#define MyAppExeName "Iniciar-DistribuidorPro.bat"

[Setup]
AppId={{A7B3C9D1-4E2F-5A6B-8C9D-0E1F2A3B4C5D}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
DefaultDirName={autopf}\VC-DistribuidorPro
DefaultGroupName={#MyAppName}
DisableProgramGroupPage=yes
OutputDir={#OutputDir}
OutputBaseFilename=VC-DistribuidorPro-Setup
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=admin
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
UninstallDisplayIcon={app}\{#MyAppExeName}
LicenseFile={#LicenseFile}
InfoBeforeFile={#InfoBeforeFile}

[Languages]
Name: "spanish"; MessagesFile: "compiler:Languages\Spanish.isl"

[Tasks]
Name: "desktopicon"; Description: "Crear icono en el Escritorio"; GroupDescription: "Accesos directos:"; Flags: checkedonce
Name: "configure"; Description: "Configurar base de datos al terminar (PostgreSQL)"; GroupDescription: "Post-instalacion:"; Flags: checkedonce

[Files]
Source: "{#StagingDir}\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; WorkingDir: "{app}"
Name: "{group}\Configurar base de datos"; Filename: "{app}\CONFIGURAR.bat"; WorkingDir: "{app}"
Name: "{group}\Desinstalar {#MyAppName}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon; WorkingDir: "{app}"

[Run]
Filename: "powershell.exe"; Parameters: "-NoProfile -ExecutionPolicy Bypass -File ""{app}\api-usuarios\scripts\post-instalacion-setup.ps1"" -Destino ""{app}"" -DbPassword ""{code:GetDbPassword}"""; StatusMsg: "Configurando base de datos y usuarios..."; Flags: runhidden waituntilterminated; Tasks: configure; Check: NeedsConfigure

[UninstallDelete]
Type: filesandordirs; Name: "{app}\api-usuarios\node_modules"

[Code]
var
  DbPasswordPage: TInputQueryWizardPage;
  DbPasswordValue: String;

function GetDbPassword(Param: String): String;
begin
  Result := DbPasswordValue;
end;

function NeedsConfigure: Boolean;
begin
  Result := WizardIsTaskSelected('configure');
end;

procedure InitializeWizard;
begin
  DbPasswordPage := CreateInputQueryPage(wpSelectTasks,
    'PostgreSQL', 'Configuracion de la base de datos',
    'Debe tener PostgreSQL instalado en esta PC.' + #13#10 +
    'Ingrese la contraseña del usuario postgres:');
  DbPasswordPage.Add('Contraseña:', True);
end;

function NextButtonClick(CurPageID: Integer): Boolean;
begin
  Result := True;
  if CurPageID = DbPasswordPage.ID then
  begin
    DbPasswordValue := DbPasswordPage.Values[0];
    if DbPasswordValue = '' then
    begin
      MsgBox('Indique la contraseña de PostgreSQL.', mbError, MB_OK);
      Result := False;
    end;
  end;
end;

function ShouldSkipPage(PageID: Integer): Boolean;
begin
  Result := False;
  if PageID = DbPasswordPage.ID then
    Result := not WizardIsTaskSelected('configure');
end;

function InitializeSetup: Boolean;
var
  ErrorCode: Integer;
  NodeVer: String;
begin
  Result := True;
  if not RegQueryStringValue(HKLM, 'SOFTWARE\Node.js', 'Version', NodeVer) then
  begin
    if MsgBox('Node.js no parece estar instalado.' + #13#10 + #13#10 +
      'El programa lo necesita para funcionar.' + #13#10 +
      'Desea abrir la pagina de descarga de Node.js ahora?',
      mbConfirmation, MB_YESNO) = IDYES then
    begin
      ShellExec('open', 'https://nodejs.org/', '', '', SW_SHOW, ewNoWait, ErrorCode);
    end;
  end;
  if not RegKeyExists(HKLM, 'SOFTWARE\PostgreSQL\Installations') then
  begin
    if MsgBox('PostgreSQL no parece estar instalado.' + #13#10 + #13#10 +
      'El programa lo necesita para la base de datos.' + #13#10 +
      'Desea abrir la pagina de descarga de PostgreSQL ahora?',
      mbConfirmation, MB_YESNO) = IDYES then
    begin
      ShellExec('open', 'https://www.postgresql.org/download/windows/', '', '', SW_SHOW, ewNoWait, ErrorCode);
    end;
  end;
end;

procedure CurStepChanged(CurStep: TSetupStep);
begin
  if (CurStep = ssPostInstall) and not WizardIsTaskSelected('configure') then
  begin
    MsgBox('Instalacion de archivos completada.' + #13#10 + #13#10 +
      'Ejecute "Configurar base de datos" desde el menu Inicio' + #13#10 +
      'antes de abrir el programa por primera vez.',
      mbInformation, MB_OK);
  end;
end;

[Messages]
spanish.WelcomeLabel2=Esto instalara [name/ver] en su computadora.%n%nRYV Frutas del Caribe — gestion de ventas, entregas, canastos y credito.%n%nSe recomienda cerrar otras aplicaciones antes de continuar.
