import React, { useState } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';

const PageContainer = styled.div`
  min-height: calc(100vh - 64px);
  background: linear-gradient(135deg, #f6f8fa 0%, #ffffff 100%);
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 2rem;
`;

const Hero = styled.div`
  text-align: center;
  margin-bottom: 4rem;

  h1 {
    font-size: 3rem;
    background: linear-gradient(135deg, #000 0%, #333 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 1.5rem;
  }

  p {
    font-size: 1.25rem;
    color: #666;
    max-width: 600px;
    margin: 0 auto;
  }
`;

const Section = styled.section`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }

  h2 {
    font-size: 1.75rem;
    margin-bottom: 1.5rem;
    color: #1a1a1a;
  }
`;

const StepGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
`;

const Step = styled(motion.div)`
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #e9ecef;

  h3 {
    font-size: 1.25rem;
    margin-bottom: 1rem;
    color: #1a1a1a;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  p {
    color: #666;
    line-height: 1.6;
  }
`;

const CodeBlock = styled.div`
  background: #1a1a1a;
  border-radius: 12px;
  padding: 1.5rem;
  margin: 1rem 0;
  position: relative;

  pre {
    margin: 0;
    color: #fff;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.9rem;
    overflow-x: auto;
  }

  button {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: #fff;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
    transition: background 0.2s;

    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  }
`;

const ConfigOptions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin: 1.5rem 0;
`;

const ConfigOption = styled.div`
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e9ecef;

  h4 {
    font-size: 1rem;
    margin-bottom: 0.5rem;
    color: #1a1a1a;
  }

  code {
    display: block;
    background: #fff;
    padding: 0.5rem;
    border-radius: 4px;
    border: 1px solid #e9ecef;
    font-size: 0.875rem;
    color: #333;
    margin-top: 0.5rem;
  }

  p {
    font-size: 0.875rem;
    color: #666;
    margin: 0.5rem 0;
  }
`;

const DemoButton = styled.button`
  background: #000;
  color: white;
  padding: 1rem 2rem;
  border-radius: 8px;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 2rem auto;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const Tag = styled.span`
  background: #e9ecef;
  color: #495057;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: 0.5rem;
`;

const IntegrationPage: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const basicCode = `<!-- Feattie Chat Widget -->
<script>
  window.FEATTIE_CONFIG = {
    apiUrl: 'https://api.feattie.com',
    theme: 'light',
    position: 'bottom-right'
  };
</script>
<script src="https://cdn.feattie.com/widget.js"></script>`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const stepVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <PageContainer>
      <ContentWrapper>
        <Hero>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Feattie Chat Widget Entegrasyonu
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Yapay zeka destekli ürün danışmanını web sitenize entegre edin.
            Tek satır kod ile müşterilerinize kişiselleştirilmiş ürün önerileri sunun.
          </motion.p>
        </Hero>

        <Section>
          <h2>Hızlı Başlangıç</h2>
          <CodeBlock>
            <pre>{basicCode}</pre>
            <button onClick={() => copyToClipboard(basicCode)}>
              {copied ? '✓ Kopyalandı' : 'Kopyala'}
            </button>
          </CodeBlock>

          <StepGrid>
            <Step
              variants={stepVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
            >
              <h3>
                1. Script Ekleyin
                <Tag>Kolay</Tag>
              </h3>
              <p>
                HTML sayfanızın &lt;head&gt; veya &lt;body&gt; bölümüne widget scriptini ekleyin.
                Otomatik olarak sitenize uyum sağlayacaktır.
              </p>
            </Step>

            <Step
              variants={stepVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <h3>
                2. Özelleştirin
                <Tag>Opsiyonel</Tag>
              </h3>
              <p>
                Renk, pozisyon, başlık gibi özellikleri markanıza uygun olarak özelleştirin.
                Tema ve dil seçenekleriyle tam kontrol sizde.
              </p>
            </Step>

            <Step
              variants={stepVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <h3>
                3. Yayınlayın
                <Tag>Hızlı</Tag>
              </h3>
              <p>
                Değişiklikleri yayınlayın ve yapay zeka destekli ürün danışmanınız
                hemen çalışmaya başlasın.
              </p>
            </Step>
          </StepGrid>
        </Section>

        <Section>
          <h2>Özelleştirme Seçenekleri</h2>
          <p>Widget'ı markanıza uygun hale getirmek için aşağıdaki seçenekleri kullanabilirsiniz:</p>
          
          <ConfigOptions>
            <ConfigOption>
              <h4>Ana Renk</h4>
              <p>Widget'ın ana rengini belirleyin</p>
              <code>theme.primaryColor: '#000000'</code>
            </ConfigOption>

            <ConfigOption>
              <h4>Pozisyon</h4>
              <p>Widget'ın konumunu ayarlayın</p>
              <code>position: 'bottom-right'</code>
            </ConfigOption>

            <ConfigOption>
              <h4>Başlık</h4>
              <p>Chat başlığını özelleştirin</p>
              <code>title: 'Ürün Danışmanı'</code>
            </ConfigOption>

            <ConfigOption>
              <h4>Dil</h4>
              <p>Arayüz dilini değiştirin</p>
              <code>language: 'tr'</code>
            </ConfigOption>
          </ConfigOptions>
        </Section>

        <Section>
          <h2>Shopify Entegrasyonu</h2>
          <p>Shopify mağazanıza entegre etmek için şu adımları izleyin:</p>
          
          <StepGrid>
            <Step
              variants={stepVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h3>1. Tema Düzenleyicisini Açın</h3>
              <p>Shopify admin panelinden Online Store → Themes → Actions → Edit code yolunu izleyin.</p>
            </Step>

            <Step
              variants={stepVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <h3>2. Scripti Ekleyin</h3>
              <p>theme.liquid dosyasını açın ve &lt;/head&gt; etiketinden önce widget scriptini yapıştırın.</p>
            </Step>

            <Step
              variants={stepVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <h3>3. Yayınlayın</h3>
              <p>Değişiklikleri kaydedin ve temanızı yayınlayın.</p>
            </Step>
          </StepGrid>
        </Section>

        <DemoButton onClick={() => window.location.href = '/'}>
          <span>Canlı Demo'yu Deneyin</span>
          <span>→</span>
        </DemoButton>
      </ContentWrapper>
    </PageContainer>
  );
};

export default IntegrationPage;