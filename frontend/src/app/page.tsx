import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Bot, CreditCard, Shield, Users, Zap, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Bot className="h-8 w-8 text-blue-500" />
            <span className="text-2xl font-bold text-white">BlackinBot</span>
          </div>
          <div className="flex space-x-4">
            <Link href="/login">
              <Button variant="ghost" className="text-gray-300 hover:text-white">
                Entrar
              </Button>
            </Link>
            <Link href="/cadastro">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Criar meu bot
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            Crie seu Bot VIP no Telegram
          </h1>
          <h2 className="text-3xl md:text-4xl font-semibold mb-8 text-gray-300">
            Monetize seu grupo com Pix em segundos!
          </h2>
          <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto">
            Automatize completamente a venda de acesso ao seu grupo VIP no Telegram. 
            Sistema antifraude, pagamentos via Pix instantâneos e entrada automática dos membros.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/cadastro">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4">
                <Bot className="mr-2 h-5 w-5" />
                Criar meu bot agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-gray-600 text-gray-300 hover:bg-gray-800">
                Já tenho conta
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-20 bg-gray-900/30">
        <div className="container mx-auto px-4">
          <h3 className="text-4xl font-bold text-center mb-16 text-white">
            Como Funciona
          </h3>
          <div className="grid md:grid-cols-4 gap-8">
            <Card className="bg-gray-900 border-gray-700 text-center">
              <CardHeader>
                <Bot className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <CardTitle className="text-white">1. Crie seu Bot</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400">
                  Configure seu bot no @BotFather do Telegram com nossas instruções simples
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700 text-center">
              <CardHeader>
                <CreditCard className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <CardTitle className="text-white">2. Defina Planos</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400">
                  Configure os preços e duração dos planos de acesso ao seu grupo VIP
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700 text-center">
              <CardHeader>
                <Zap className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <CardTitle className="text-white">3. Pagamento Pix</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400">
                  Clientes pagam via Pix instantaneamente através da integração PushinPay
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700 text-center">
              <CardHeader>
                <Users className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                <CardTitle className="text-white">4. Entrada Automática</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400">
                  Após o pagamento, o cliente é automaticamente adicionado ao grupo VIP
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Vantagens */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-4xl font-bold mb-8 text-white">
                Vantagens da Automação
              </h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-xl font-semibold text-white mb-2">Sistema Antifraude</h4>
                    <p className="text-gray-400">
                      Validação automática de pagamentos e prevenção contra tentativas de burla
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-xl font-semibold text-white mb-2">Disponibilidade 24/7</h4>
                    <p className="text-gray-400">
                      Vendas automáticas mesmo quando você está dormindo ou ocupado
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-xl font-semibold text-white mb-2">Gestão Completa</h4>
                    <p className="text-gray-400">
                      Painel administrativo com estatísticas, controle de usuários e remarketing
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-xl font-semibold text-white mb-2">Pagamentos Instantâneos</h4>
                    <p className="text-gray-400">
                      Receba o dinheiro na hora via Pix, sem esperar processamento
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:text-center">
              <Card className="bg-gradient-to-br from-blue-900 to-purple-900 border-blue-700 p-8">
                <CardHeader className="text-center">
                  <Shield className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                  <CardTitle className="text-2xl text-white">Sistema Antifraude</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-blue-200 text-lg">
                    Nossa tecnologia avançada detecta e previne tentativas de fraude, 
                    garantindo que apenas pagamentos válidos concedam acesso ao grupo.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Como o Sistema Lucra */}
      <section className="py-20 bg-gray-900/30">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-4xl font-bold mb-8 text-white">
            Como o Sistema Lucra
          </h3>
          <div className="max-w-3xl mx-auto">
            <Card className="bg-gray-900 border-gray-700 p-8">
              <CardContent className="space-y-6">
                <div className="text-6xl font-bold text-green-500 mb-4">
                  R$ 1,48 + 5%
                </div>
                <h4 className="text-2xl font-semibold text-white">
                  Cobrança apenas por transação
                </h4>
                <p className="text-gray-400 text-lg">
                  Sem mensalidade, sem taxas de setup, sem pegadinhas. 
                  Você só paga quando vende, garantindo que o sistema seja 
                  verdadeiramente lucrativo para você.
                </p>
                <div className="bg-gray-800 rounded-lg p-4 mt-6">
                  <p className="text-sm text-gray-300">
                    <strong>Exemplo:</strong> Se você vender um plano de R$ 50,00, 
                    pagará apenas R$ 4,00 de taxa total (R$ 1,48 + R$ 2,50).
                    Você recebe R$ 46,00 líquidos!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-4xl font-bold mb-8 text-white">
            Pronto para Automatizar suas Vendas?
          </h3>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Junte-se a centenas de criadores de conteúdo que já automatizaram 
            suas vendas e aumentaram sua receita com o BlackinBot.
          </p>
          <Link href="/cadastro">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-xl px-12 py-6">
              <Bot className="mr-3 h-6 w-6" />
              Começar Agora - É Grátis
              <ArrowRight className="ml-3 h-6 w-6" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-gray-900 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Bot className="h-6 w-6 text-blue-500" />
            <span className="text-xl font-bold text-white">BlackinBot</span>
          </div>
          <p className="text-gray-400">
            © 2024 BlackinBot. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
