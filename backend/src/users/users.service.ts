import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';
import { User, UserDocument } from './schemas/user.schema';
import { ListarUsuariosDto } from './dto/listar-usuarios.dto';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectModel(User.name) private model: Model<UserDocument>,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async onModuleInit() {
    const existeAdmin = await this.model.exists({ perfil: 'administrador' });
    if (!existeAdmin) {
      const correo = process.env.ADMIN_CORREO;
      const nombreUsuario = process.env.ADMIN_USUARIO;
      const password = process.env.ADMIN_PASSWORD;

      if (correo && nombreUsuario && password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await this.model.create({
          nombre: 'Admin',
          apellido: 'PLOT',
          correo: correo.toLowerCase().trim(),
          nombreUsuario: nombreUsuario.trim(),
          fechaNacimiento: new Date('2000-01-01'),
          password: hashedPassword,
          perfil: 'administrador',
          activo: true,
        });
      }
    }
  }

  create(data: Partial<User>) {
    return this.model.create(data);
  }

  findByCorreoOUsuario(correo: string, nombreUsuario: string) {
    return this.model.findOne({
      $or: [{ correo: correo.toLowerCase() }, { nombreUsuario }],
    });
  }

  findByIdentificador(identificador: string) {
    return this.model
      .findOne({ $or: [{ correo: identificador.toLowerCase() }, { nombreUsuario: identificador }] })
      .select('+password');
  }

  findById(id: string) {
    return this.model.findById(id);
  }

  // Método único para crear usuarios usado por registro público y alta por admin
  async crearUsuario(
    datos: {
      nombre: string;
      apellido: string;
      correo: string;
      nombreUsuario: string;
      password: string;
      fechaNacimiento: string | Date;
      descripcion?: string;
      perfil?: string;
    },
    file?: Express.Multer.File,
    esRegistroPublico: boolean = false,
  ) {
    const existe = await this.findByCorreoOUsuario(datos.correo, datos.nombreUsuario);
    if (existe) {
      throw new ConflictException('El correo o el usuario ya existe'); // 409
    }

    let imagenPerfil: string | undefined;
    if (file) {
      const r = await this.cloudinary.subirImagen(file, 'perfiles');
      imagenPerfil = r.url;
    }

    const hashedPassword = await bcrypt.hash(datos.password, 10);
    const perfil = esRegistroPublico ? 'usuario' : (datos.perfil ?? 'usuario');

    const user = await this.model.create({
      nombre: datos.nombre,
      apellido: datos.apellido,
      correo: datos.correo.toLowerCase().trim(),
      nombreUsuario: datos.nombreUsuario.trim(),
      password: hashedPassword,
      fechaNacimiento: new Date(datos.fechaNacimiento),
      descripcion: datos.descripcion || '',
      imagenPerfil,
      perfil,
      activo: true,
    });

    const { password, ...resto } = user.toObject();
    return resto;
  }

  async listar(q: ListarUsuariosDto) {
    const [items, total] = await Promise.all([
      this.model
        .find()
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(q.offset)
        .limit(q.limit)
        .lean(),
      this.model.countDocuments(),
    ]);

    return {
      items,
      total,
      offset: q.offset,
      limit: q.limit,
    };
  }

  async deshabilitar(id: string, adminId: string) {
    if (id === adminId) {
      throw new BadRequestException('No podés deshabilitar tu propia cuenta'); // 400
    }
    const user = await this.model.findById(id);
    if (!user) {
      throw new NotFoundException('El usuario no existe'); // 404
    }
    user.activo = false;
    await user.save();
    return { mensaje: 'Usuario deshabilitado exitosamente' };
  }

  async habilitar(id: string) {
    const user = await this.model.findById(id);
    if (!user) {
      throw new NotFoundException('El usuario no existe'); // 404
    }
    user.activo = true;
    await user.save();
    return { mensaje: 'Usuario habilitado exitosamente' };
  }
}
