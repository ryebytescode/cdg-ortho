import { MakerDMG } from '@electron-forge/maker-dmg'
import { MakerSquirrel } from '@electron-forge/maker-squirrel'
import type { ForgeConfig } from '@electron-forge/shared-types'
import { DB_FILE_NAME } from './src/shared/constants'

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    osxSign: {},
    extraResource: [`build/${DB_FILE_NAME}.db`],
  },
  makers: [
    new MakerSquirrel(
      {
        owners: 'CDG',
        setupIcon: 'build/icon.ico',
      },
      ['win32']
    ),
    new MakerDMG(
      {
        name: 'CDG Ortho',
        icon: 'build/icon.icns',
        appPath: '.',
        title: 'CDG Ortho Installer',
      },
      ['x64', 'arm64']
    ),
  ],
}

export default config
