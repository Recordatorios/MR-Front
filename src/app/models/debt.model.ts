export interface Deuda {
  id: number;
  numeroDocumento: string;
  empresa: string;
  montoTotal: number;
  fechaVencimiento: string;
  estado: | 'proxima' | 'pendiente' | 'pagada' | 'vencida';
}
