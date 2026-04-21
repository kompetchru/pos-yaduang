/**
 * อัพเดท imageUrl ของสินค้าให้ชี้ไปที่รูปจริงจากเว็บ
 * รูปจาก open sources ที่ hotlink ได้
 * 
 * วิธีรัน: npx ts-node --transpile-only scripts/set-product-images.ts
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// รูปสินค้าจริงจาก public CDN / wiki commons / open sources
const imageMap: Record<string, string> = {
  // เครื่องดื่ม
  'DRK001': 'https://www.singhadrinkingwater.com/wp-content/uploads/2023/06/singha-600ml.png',
  'DRK002': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Coca-Cola_logo.svg/200px-Coca-Cola_logo.svg.png',
  'DRK003': 'https://f.ptcdn.info/398/080/000/rn0iqfkfb7VfWBb3Gxf-o.jpg',
  'DRK004': 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a3/M-150_logo.png/220px-M-150_logo.png',
  'DRK005': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Glass_of_Milk_%2833657535532%29.jpg/220px-Glass_of_Milk_%2833657535532%29.jpg',

  // ขนม
  'SNK001': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Lays_brand_logo.svg/220px-Lays_brand_logo.svg.png',
  'SNK002': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Fresh_made_potato_chips.jpg/220px-Fresh_made_potato_chips.jpg',
  'SNK003': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Pocky_chocolate.jpg/220px-Pocky_chocolate.jpg',
  'SNK004': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Halls_logo.svg/220px-Halls_logo.svg.png',

  // อาหารสำเร็จรูป
  'INS001': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Mama_instant_noodles.jpg/220px-Mama_instant_noodles.jpg',
  'INS002': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Mama_Noodles_Tom_Yum.jpg/220px-Mama_Noodles_Tom_Yum.jpg',
  'INS003': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Canned_sardines.jpg/220px-Canned_sardines.jpg',

  // ของใช้ในบ้าน
  'HOU001': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Surf_Excel_Logo.svg/220px-Surf_Excel_Logo.svg.png',
  'HOU002': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Sunlight_dishwashing_liquid.jpg/220px-Sunlight_dishwashing_liquid.jpg',
  'HOU003': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Toilet_paper_roll.jpg/220px-Toilet_paper_roll.jpg',

  // เครื่องปรุง
  'SEA001': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Fish_sauce.jpg/220px-Fish_sauce.jpg',
  'SEA002': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Oyster_sauce.jpg/220px-Oyster_sauce.jpg',
  'SEA003': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Sugar_2xmacro.jpg/220px-Sugar_2xmacro.jpg',

  // ของสด
  'FRS001': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Chicken_eggs.jpg/220px-Chicken_eggs.jpg',
  'FRS002': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Long_grain_rice.jpg/220px-Long_grain_rice.jpg',

  // สุขภาพ/ยา
  'HLT001': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Paracetamol_tablets.jpg/220px-Paracetamol_tablets.jpg',
  'HLT002': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Tiger_Balm_red_and_white.jpg/220px-Tiger_Balm_red_and_white.jpg',
}

async function main() {
  console.log('🖼️  อัพเดทรูปสินค้าจริง...\n')

  const products = await prisma.product.findMany({ where: { isActive: true } })

  for (const product of products) {
    const url = imageMap[product.sku]
    if (url) {
      await prisma.product.update({
        where: { id: product.id },
        data: { imageUrl: url },
      })
      console.log(`✅ ${product.sku} ${product.name}`)
    } else {
      console.log(`⏭️  ${product.sku} ${product.name} — ไม่มี URL`)
    }
  }

  console.log('\n🎉 เสร็จ!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
