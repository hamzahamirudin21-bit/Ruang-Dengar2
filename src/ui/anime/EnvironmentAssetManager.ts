export type LabEnvironmentCategory =
  | 'electronics-lab'
  | 'programming-lab'
  | '3d-printing-lab'
  | 'welding-workshop'
  | 'discussion-room'
  | 'supporting-environment';

export interface EnvironmentPropAsset {
  id: string;
  category: LabEnvironmentCategory;
  name: string;
  zoneId: string;
  sceneBackdropUrl: string;
  layer: 'background' | 'midground' | 'props' | 'foreground';
}

export const ENVIRONMENT_PROP_CATALOG: readonly EnvironmentPropAsset[] = [
  // A. Electronics Lab
  { id: 'env-elec-oscilloscope', category: 'electronics-lab', name: 'Digital Oscilloscope', zoneId: 'elektronik-iot', sceneBackdropUrl: '/assets/scenes/elektronik.png', layer: 'props' },
  { id: 'env-elec-psu', category: 'electronics-lab', name: 'DC Power Supply', zoneId: 'elektronik-iot', sceneBackdropUrl: '/assets/scenes/elektronik.png', layer: 'props' },
  { id: 'env-elec-multimeter', category: 'electronics-lab', name: 'Precision Multimeter', zoneId: 'elektronik-iot', sceneBackdropUrl: '/assets/scenes/elektronik.png', layer: 'props' },
  { id: 'env-elec-breadboard', category: 'electronics-lab', name: 'Breadboard & Jumper Wires', zoneId: 'elektronik-iot', sceneBackdropUrl: '/assets/scenes/elektronik.png', layer: 'props' },
  { id: 'env-elec-pcb', category: 'electronics-lab', name: 'PCB & Microcontroller Module', zoneId: 'elektronik-iot', sceneBackdropUrl: '/assets/scenes/elektronik.png', layer: 'props' },
  { id: 'env-elec-solder', category: 'electronics-lab', name: 'Soldering Station', zoneId: 'elektronik-iot', sceneBackdropUrl: '/assets/scenes/elektronik.png', layer: 'props' },
  { id: 'env-elec-bench', category: 'electronics-lab', name: 'Electronics Workbench', zoneId: 'elektronik-iot', sceneBackdropUrl: '/assets/scenes/elektronik.png', layer: 'midground' },

  // B. Programming Lab
  { id: 'env-prog-monitor', category: 'programming-lab', name: 'Dual Code Monitors', zoneId: 'pemrograman', sceneBackdropUrl: '/assets/scenes/pemrograman.png', layer: 'props' },
  { id: 'env-prog-keyboard', category: 'programming-lab', name: 'Mechanical Keyboard & Mouse', zoneId: 'pemrograman', sceneBackdropUrl: '/assets/scenes/pemrograman.png', layer: 'props' },
  { id: 'env-prog-desk', category: 'programming-lab', name: 'Workstation Desk & Chair', zoneId: 'pemrograman', sceneBackdropUrl: '/assets/scenes/pemrograman.png', layer: 'midground' },
  { id: 'env-prog-devboard', category: 'programming-lab', name: 'MCU Development Board & USB', zoneId: 'pemrograman', sceneBackdropUrl: '/assets/scenes/pemrograman.png', layer: 'props' },

  // C. 3D Printing Lab
  { id: 'env-3d-printer', category: '3d-printing-lab', name: 'CoreXY 3D Printer', zoneId: 'cetak-3d', sceneBackdropUrl: '/assets/scenes/cetak3d.png', layer: 'midground' },
  { id: 'env-3d-spools', category: '3d-printing-lab', name: 'Filament Spools & Rack', zoneId: 'cetak-3d', sceneBackdropUrl: '/assets/scenes/cetak3d.png', layer: 'props' },
  { id: 'env-3d-prints', category: '3d-printing-lab', name: 'Printed Robot Chassis Parts', zoneId: 'cetak-3d', sceneBackdropUrl: '/assets/scenes/cetak3d.png', layer: 'props' },

  // D. Welding Workshop
  { id: 'env-weld-machine', category: 'welding-workshop', name: 'Welding Machine & Table', zoneId: 'las', sceneBackdropUrl: '/assets/scenes/las.png', layer: 'midground' },
  { id: 'env-weld-k3', category: 'welding-workshop', name: 'K3 Welding Helmet, Gloves & APAR', zoneId: 'las', sceneBackdropUrl: '/assets/scenes/las.png', layer: 'props' },
  { id: 'env-weld-gas', category: 'welding-workshop', name: 'Shielding Gas Cylinder', zoneId: 'las', sceneBackdropUrl: '/assets/scenes/las.png', layer: 'midground' },

  // E. Discussion Room
  { id: 'env-disc-table', category: 'discussion-room', name: 'Oak Discussion Table & Chairs', zoneId: 'diskusi', sceneBackdropUrl: '/assets/scenes/diskusi.png', layer: 'midground' },
  { id: 'env-disc-docs', category: 'discussion-room', name: 'Blueprints, Laptop & Whiteboard', zoneId: 'diskusi', sceneBackdropUrl: '/assets/scenes/diskusi.png', layer: 'props' },
  { id: 'env-disc-rover', category: 'discussion-room', name: 'Mini Robotics Rover', zoneId: 'diskusi', sceneBackdropUrl: '/assets/scenes/diskusi.png', layer: 'foreground' },

  // F. Supporting Environment
  { id: 'env-sup-doors', category: 'supporting-environment', name: 'Glass Sliding Doors & Frames', zoneId: 'diskusi', sceneBackdropUrl: '/assets/scenes/diskusi.png', layer: 'midground' },
  { id: 'env-sup-consult', category: 'supporting-environment', name: 'Consultation Sofa & Warm Lamp', zoneId: 'konsultasi', sceneBackdropUrl: '/assets/scenes/konsultasi.png', layer: 'midground' },
];

export class EnvironmentAssetManager {
  public listByCategory(category: LabEnvironmentCategory): readonly EnvironmentPropAsset[] {
    return ENVIRONMENT_PROP_CATALOG.filter((p) => p.category === category);
  }

  public listByZone(zoneId: string): readonly EnvironmentPropAsset[] {
    return ENVIRONMENT_PROP_CATALOG.filter((p) => p.zoneId === zoneId);
  }

  public getAll(): readonly EnvironmentPropAsset[] {
    return ENVIRONMENT_PROP_CATALOG;
  }
}

export const sharedEnvironmentAssetManager = new EnvironmentAssetManager();
