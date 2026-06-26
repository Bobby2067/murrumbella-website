export default function ReviewPage() {
  const photos = [
    '7E6B721C-5988-49A4-BB48-6EA99C54C1EF.jpg',
    'IMG_1301.JPEG',
    'IMG_1308.JPEG',
    'IMG_1309.JPEG',
    'IMG_1310.JPEG',
    'IMG_1311.JPEG',
    'IMG_1312.JPEG',
    'IMG_1313.JPEG',
    'IMG_1314.JPEG',
    'IMG_1315.JPEG',
    'IMG_1324.JPEG',
    'IMG_2168.JPEG',
    'IMG_2175.JPEG',
    'IMG_2201.jpg',
    'IMG_2203.JPEG',
    'IMG_2203.jpg',
    'IMG_2204.JPEG',
    'IMG_2205.JPEG',
    'IMG_2205.jpg',
    'IMG_2206.JPEG',
    'IMG_2206.jpg',
    'IMG_2207.JPEG',
    'IMG_2207.jpg',
    'IMG_2724.jpg',
    'IMG_2741.jpg',
    'IMG_2742.jpg',
    'IMG_2743.jpg',
    'IMG_2754.jpg',
    'IMG_2756.jpg',
    'IMG_2826.jpg',
    'IMG_2830.jpg',
    'IMG_2831.jpg',
    'IMG_2832.jpg',
    'IMG_2833.jpg',
    'IMG_2834.jpg',
    'IMG_2835.jpg',
    'IMG_2836.jpg',
    'IMG_2837.jpg',
    'IMG_2838.jpg',
    'IMG_2839.jpg',
    'IMG_2840.jpg',
    'IMG_2841.jpg',
    'IMG_2842.jpg',
    'IMG_2864.jpg',
    'IMG_2865.jpg',
    'IMG_2866.jpg',
    'IMG_2867.jpg',
    'IMG_2868.jpg',
    'IMG_2869.jpg',
    'IMG_2870.jpg',
    'IMG_2871.jpg',
    'IMG_2872.jpg',
    'IMG_2873.jpg',
    'IMG_2957.JPEG',
    'IMG_2958.JPEG',
    'IMG_2959.JPEG',
    'IMG_2960.JPEG',
    'IMG_2961.JPEG',
    'IMG_2962.JPEG',
    'IMG_2963.JPEG',
    'IMG_2965.JPEG',
    'IMG_2966.JPEG',
    'IMG_2967.JPEG',
    'IMG_2968.JPEG',
    'IMG_2969.JPEG',
    'IMG_2970.JPEG',
    'IMG_2971.JPEG',
    'IMG_2972.JPEG',
    'IMG_2973.JPEG',
    'IMG_2974.JPEG',
    'IMG_3005.JPEG',
    'IMG_3080.JPEG',
    'IMG_3080.jpg',
    'IMG_3081.JPEG',
    'IMG_3082.JPEG',
    'IMG_3202.JPEG',
    'IMG_3203.JPEG',
    'IMG_3204.JPEG',
    'IMG_3205.JPEG',
    'IMG_3206.JPEG',
    'IMG_3207.JPEG',
    'IMG_3208.JPEG',
    'IMG_3209.JPEG',
    'IMG_3210.JPEG',
    'IMG_3211.JPEG',
    'IMG_3212.JPEG',
    'IMG_3213.JPEG',
    'IMG_3213.jpg',
    'IMG_3214.JPEG',
    'IMG_3239.JPEG',
    'IMG_3240.JPEG',
    'IMG_3241.JPEG',
    'IMG_3242.JPEG',
    'IMG_3243.JPEG',
    'IMG_3244.JPEG',
    'IMG_3245.JPEG',
    'IMG_3246.JPEG',
    'IMG_3246.jpg',
    'IMG_3247.JPEG',
    'IMG_3248.JPEG',
    'IMG_3249.JPEG',
    'IMG_3250.JPEG',
    'IMG_3251.JPEG',
    'IMG_3252.JPEG',
    'IMG_3308.JPEG',
    'IMG_3309.JPEG',
    'IMG_3310.JPEG',
    'IMG_3311.JPEG',
    'IMG_3317.JPEG',
    'IMG_3318.JPEG',
    'IMG_3319.JPEG',
    'IMG_3320.JPEG',
    'IMG_3321.JPEG',
    'IMG_3322.JPEG',
    'IMG_3323.JPEG',
    'IMG_3324.JPEG',
    'IMG_3325.JPEG',
    'IMG_4682.JPEG',
    'IMG_4683.JPEG',
    'IMG_4684.JPEG',
    'IMG_4685.JPEG',
    'IMG_4686.JPEG',
    'IMG_4687.JPEG',
    'IMG_4892.JPEG',
    'IMG_4893.JPEG',
    'IMG_4894.JPEG',
    'IMG_4895.JPEG',
    'IMG_4896.JPEG',
    'IMG_4897.JPEG',
    'IMG_4898.JPEG',
    'IMG_4899.JPEG',
    'IMG_4900.JPEG',
    'IMG_6509.JPEG',
    'IMG_6510.JPEG',
    'IMG_6511.JPEG',
    'IMG_6512.JPEG',
    'IMG_6513.JPEG',
    'IMG_6514.JPEG',
    'IMG_6515.JPEG',
    'IMG_6516.JPEG',
    'IMG_6517.JPEG',
    'IMG_6518.JPEG',
    'IMG_6519.JPEG',
    'IMG_6520.JPEG',
    'IMG_6521.JPEG',
    'IMG_6522.JPEG',
    'IMG_6523.JPEG',
    'IMG_6524.JPEG',
    'IMG_6525.JPEG',
    'IMG_6526.JPEG',
    'IMG_6527.JPEG',
    'IMG_6528.JPEG',
  ]

  return (
    <div style={{ background: '#111', minHeight: '100vh', padding: '2rem', fontFamily: 'monospace' }}>
      <h1 style={{ color: '#fff', marginBottom: '0.5rem', fontSize: '1.5rem' }}>Photo Review — {photos.length} images</h1>
      <p style={{ color: '#888', marginBottom: '2rem', fontSize: '0.85rem' }}>
        Click any photo to open full size. Note filename + number to curate the gallery.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
        {photos.map((filename, i) => (
          <a
            key={filename}
            href={`/photos/${filename}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'block', textDecoration: 'none' }}
          >
            <div style={{ position: 'relative', paddingBottom: '75%', background: '#222', borderRadius: '6px', overflow: 'hidden' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/photos/${filename}`}
                alt={filename}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                loading="lazy"
              />
              <div style={{
                position: 'absolute', top: '6px', left: '6px',
                background: 'rgba(0,0,0,0.7)', color: '#fff',
                fontSize: '11px', padding: '2px 6px', borderRadius: '3px', fontWeight: 'bold'
              }}>
                #{i + 1}
              </div>
            </div>
            <p style={{ color: '#aaa', fontSize: '10px', marginTop: '4px', wordBreak: 'break-all' }}>{filename}</p>
          </a>
        ))}
      </div>
    </div>
  )
}
