import { MakerDMG } from '@electron-forge/maker-dmg'
import { MakerSquirrel } from '@electron-forge/maker-squirrel'
import type { ForgeConfig } from '@electron-forge/shared-types'
import { DB_FILE_NAME } from './src/shared/constants'

const config: ForgeConfig = {
  packagerConfig: {
    extraResource: [`build/${DB_FILE_NAME}.db`],
  },
  makers: [
    new MakerSquirrel(
      {
        authors: 'Ryu Rabino',
        owners: 'CDG',
        name: 'CDG Ortho',
        setupIcon: 'build/icon.ico',
      },
      ['x64', 'x86']
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
