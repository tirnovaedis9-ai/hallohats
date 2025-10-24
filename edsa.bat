@echo off
setlocal

set "BACKUP_DIR=.edis_backup"

REM Yedek dizininin varligini kontrol ederek modun aktif olup olmadigini anla
if exist "%BACKUP_DIR%\" (
    set "MODE_IS_ACTIVE=true"
) else (
    set "MODE_IS_ACTIVE=false"
)

if /I "%1"=="edis" (
    if %MODE_IS_ACTIVE%==true (
        echo Edis modu zaten aktif. Kapatiliyor ve yedek siliniyor...
        rd /s /q "%BACKUP_DIR%"
        echo Edis modu kapatildi.
    ) else (
        echo Edis modu aktiflestiriliyor. Dosyalarin yedegi aliniyor...
        echo Bu islem dosya sayisina gore biraz zaman alabilir.
        robocopy . "%BACKUP_DIR%" /E /XF edsa.bat /XD .git node_modules "%BACKUP_DIR%" > nul
        echo Edis modu aktif. Mevcut dosya durumu "%BACKUP_DIR%" klasorune kaydedildi.
    )
) else if /I "%1"=="nisa" (
    if %MODE_IS_ACTIVE%==true (
        echo Degisiklikler yedekten geri yukleniyor...
        echo Bu islem dosya sayisina gore biraz zaman alabilir.
        robocopy "%BACKUP_DIR%" . /MIR /XF edsa.bat /XD .git node_modules "%BACKUP_DIR%" > nul
        rd /s /q "%BACKUP_DIR%"
        echo Degisiklikler geri alindi ve Edis modu kapatildi.
    ) else (
        echo Edis modu aktif degil. Geri alinacak bir yedek yok.
    )
) else if /I "%1"=="edisnisa" (
    if %MODE_IS_ACTIVE%==true (
        echo Mevcut durum ile yedek arasindaki farklar:
        echo.
        setlocal enabledelayedexpansion
        set "current_dir_path=%CD%"
        set "backup_dir_path=%CD%\%BACKUP_DIR%"

        for /F "delims=" %%f in ('dir /s /b /a-d "%current_dir_path%"') do (
            set "full_path_current=%%f"
            set "relative_path=!full_path_current:%current_dir_path%\=!"

            rem Check for exclusions
            set "exclude_file=0"
            echo !full_path_current! | findstr /I /C:"\.git\" >nul && set "exclude_file=1"
            echo !full_path_current! | findstr /I /C:"\node_modules\" >nul && set "exclude_file=1"
            echo !full_path_current! | findstr /I /C:"\.edis_backup\" >nul && set "exclude_file=1"
            
            if "!exclude_file!"=="0" (
                set "full_path_backup=%backup_dir_path%\!relative_path!"
                
                rem Check if the file exists in backup
                if exist "!full_path_backup!" (
                    rem Compare files using fc, suppress output if identical
                    fc /B "!full_path_current!" "!full_path_backup!" >nul
                    if errorlevel 1 (
                        echo Değişen Dosya: !relative_path!
                        fc /L /N "!full_path_current!" "!full_path_backup!"
                        echo.
                    )
                ) else (
                    echo Yeni Dosya: !relative_path!
                )
            )
        )
        endlocal
    ) else (
        echo Edis modu aktif degil. Gosterilecek bir fark yok.
    )
) else (
    echo Gecersiz komut.
    echo Kullanilabilir komutlar:
    echo   edsa edis      - Dosyalarin anlik durumunu yedekler/yedegi siler.
    echo   edsa nisa      - Yedekten geri yukleme yapar.
    echo   edsa edisnisa  - Mevcut durum ile yedek arasindaki farki gosterir.
)

endlocal
