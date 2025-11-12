// C:\qhatu\backend\test-associations.js
import './src/models/index.js';
import User from './src/models/User.js';
import Role from './src/models/Role.js';
import { verifyAssociations } from './src/models/index.js';

const testAssociations = async () => {
  try {
    console.log('🧪 Probando asociaciones User-Role...\n');

    // Verificar asociaciones definidas
    verifyAssociations();

    // Probar query con include
    console.log('🔍 Buscando usuario admin@qhatu.com...\n');
    
    const user = await User.findOne({
      where: { email: 'admin@qhatu.com' },
      include: [{
        model: Role,
        as: 'rol',
        attributes: ['nombre', 'permisos']
      }]
    });

    if (user) {
      console.log('✅ Usuario encontrado:');
      console.log('   Email:', user.email);
      console.log('   Rol ID:', user.rol_id);
      console.log('   Rol Nombre:', user.rol?.nombre);
      console.log('   Permisos:', user.rol?.permisos);
    } else {
      console.log('❌ Usuario no encontrado');
    }

    console.log('\n✅ Test completado exitosamente');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error en test:');
    console.error(error);
    process.exit(1);
  }
};

testAssociations();