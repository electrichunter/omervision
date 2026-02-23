import asyncio
import edge_tts

async def amain():
    communicate = edge_tts.Communicate("Merhaba, bu bir testtir.", "tr-TR-AhmetNeural")
    await communicate.save("test.mp3")
    print("Success")

if __name__ == "__main__":
    asyncio.run(amain())
