import Link from "next/link";

const COMMANDS = [
  { cmd: ">", name: "ポインタを右へ", desc: "データポインタを1つ右に移動します。" },
  { cmd: "<", name: "ポインタを左へ", desc: "データポインタを1つ左に移動します。" },
  { cmd: "+", name: "インクリメント", desc: "現在のセルの値を1増やします（255の次は0に戻ります）。" },
  { cmd: "-", name: "デクリメント", desc: "現在のセルの値を1減らします（0の前は255に戻ります）。" },
  { cmd: ".", name: "出力", desc: "現在のセルの値をASCII文字として標準出力に書き出します。" },
  { cmd: ",", name: "入力", desc: "標準入力から1文字読み込み、現在のセルに格納します。" },
  { cmd: "[", name: "ループ開始", desc: "現在のセルが0なら対応する ] の次に飛びます。0でなければ次の命令へ進みます。" },
  { cmd: "]", name: "ループ終了", desc: "現在のセルが0でなければ対応する [ の次に戻ります。0なら次の命令へ進みます。" },
];

const HELLO_STEPS = [
  { code: "++++++++", explain: "セル0を8にする" },
  { code: "[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]", explain: "ネストしたループで複数セルの値を一気に設定" },
  { code: ">>.", explain: "セル2 (72='H') を出力" },
  { code: ">--.", explain: "セル3 (101='e') を出力" },
  { code: "+++++++..", explain: "セル3 (108='l') を2回出力" },
  { code: "+++.", explain: "セル3 (111='o') を出力" },
  { code: ">>.", explain: "セル5 (32=' ') を出力" },
  { code: "<-.", explain: "セル4 (87='W') を出力" },
  { code: "<.", explain: "セル3 (111='o') を出力" },
  { code: "+++.", explain: "セル3 (114='r') を出力" },
  { code: "------.", explain: "セル3 (108='l') を出力" },
  { code: "--------.", explain: "セル3 (100='d') を出力" },
  { code: ">>+.", explain: "セル5 (33='!') を出力" },
  { code: ">++.", explain: "セル6 (10='\\n') を出力" },
];

export default function TutorialPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-mono text-lg font-bold text-emerald-400">[&gt;_]</span>
          <h1 className="font-mono font-semibold text-zinc-100">Brainfuck Playground</h1>
        </div>
        <Link href="/" className="text-sm text-zinc-400 hover:text-emerald-400 transition-colors">
          ← エディタに戻る
        </Link>
      </header>

      <main className="max-w-3xl mx-auto p-6 space-y-10">
        <section>
          <h2 className="text-2xl font-bold font-mono text-emerald-400 mb-2">Brainfuck とは？</h2>
          <p className="text-zinc-400 leading-relaxed">
            Brainfuck は1993年にUrban Müller が設計した難解プログラミング言語です。
            命令はたった8種類の記号のみで構成されており、チューリング完全です。
            実用性はほぼありませんが、コンピュータの基本的な仕組み（メモリとポインタ）を理解するのに最適な教材です。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold font-mono text-emerald-400 mb-4">メモリモデル</h2>
          <p className="text-zinc-400 leading-relaxed mb-4">
            プログラムは<strong className="text-zinc-200">テープ</strong>と呼ばれる巨大な配列（30,000セル）にアクセスします。
            各セルは8ビット整数（0〜255）を保持し、<strong className="text-zinc-200">データポインタ</strong>が現在操作するセルを指します。
          </p>
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 flex gap-2 overflow-x-auto">
            {[0, 0, 72, 101, 108, 108, 111, 0, 0].map((v, i) => (
              <div key={i} className={`flex-shrink-0 flex flex-col items-center rounded ${i === 2 ? "bg-emerald-500 text-black" : "bg-zinc-800 text-zinc-300"}`} style={{ minWidth: "2.5rem" }}>
                <span className="text-[10px] px-1 border-b border-zinc-700 w-full text-center opacity-60">{i}</span>
                <span className="font-mono text-xs py-1">{v}</span>
              </div>
            ))}
            <div className="flex-shrink-0 flex items-center text-zinc-600 font-mono text-sm">...</div>
          </div>
          <p className="text-xs text-zinc-500 mt-2">↑ データポインタ(緑色)が現在位置しているセルを操作します</p>
        </section>

        <section>
          <h2 className="text-xl font-bold font-mono text-emerald-400 mb-4">8つのコマンド</h2>
          <div className="space-y-2">
            {COMMANDS.map(({ cmd, name, desc }) => (
              <div key={cmd} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex gap-4 items-start">
                <span className="font-mono text-2xl text-emerald-400 flex-shrink-0 w-8 text-center">{cmd}</span>
                <div>
                  <span className="font-semibold text-zinc-200 text-sm">{name}</span>
                  <p className="text-zinc-400 text-sm mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold font-mono text-emerald-400 mb-4">Hello, World! を読み解く</h2>
          <p className="text-zinc-400 mb-4">
            Brainfuck の定番プログラムを段階的に解説します。
          </p>
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 mb-4">
            <code className="font-mono text-sm text-emerald-300 break-all">
              ++++++++[&gt;++++[&gt;++&gt;+++&gt;+++&gt;+&lt;&lt;&lt;&lt;-]&gt;+&gt;+&gt;-&gt;&gt;+[&lt;]&lt;-]&gt;&gt;.&gt;---.+++++++..+++.&gt;&gt;.&lt;-.&lt;.+++.------.--------.&gt;&gt;+.&gt;++.
            </code>
          </div>
          <div className="space-y-2">
            {HELLO_STEPS.map(({ code, explain }, i) => (
              <div key={i} className="flex gap-3 items-start text-sm">
                <code className="font-mono text-emerald-300 bg-zinc-900 px-2 py-1 rounded flex-shrink-0 text-xs">{code}</code>
                <span className="text-zinc-400 pt-1">{explain}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold font-mono text-emerald-400 mb-4">ループの仕組み</h2>
          <p className="text-zinc-400 mb-3">
            <code className="text-emerald-300 font-mono">[ ]</code> はwhile文に相当します。
            <code className="font-mono text-emerald-300 bg-zinc-900 px-1 rounded ml-1">[-]</code> は
            「現在のセルを0になるまでデクリメントし続ける」という非常によく使われるパターン（セルを0にリセット）です。
          </p>
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 font-mono text-sm space-y-1">
            <p><span className="text-zinc-500">// Cで書くと: while(*p) --(*p);</span></p>
            <p className="text-emerald-300">{"[-]"}</p>
          </div>
          <p className="text-zinc-400 mt-3 text-sm">
            また <code className="font-mono text-emerald-300 bg-zinc-900 px-1 rounded">[&gt;+&lt;-]</code> は
            「現在のセルの値を右隣のセルに移動する」という基本パターンです（コピーではなく移動なので元のセルは0になります）。
          </p>
        </section>

        <div className="flex justify-center pt-4">
          <Link
            href="/"
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-mono text-sm transition-colors"
          >
            ▶ エディタで試してみる
          </Link>
        </div>
      </main>
    </div>
  );
}
