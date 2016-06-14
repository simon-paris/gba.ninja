#include "../common/SoundDriver.h"

#ifndef __EMSCRIPTEN_SOUND_DRIVER_H__
#define __EMSCRIPTEN_SOUND_DRIVER_H__

#include "../common/Types.h"

/**
 * Sound driver abstract interface for the core to use to output sound.
 * Subclass this to implement a new sound driver.
 */
class EmscriptenSoundDriver : public SoundDriver
{
public:

	/**
	 * Destructor. Free the resources allocated by the sound driver.
	 */
	~EmscriptenSoundDriver();

	/**
	 * Initialize the sound driver.
	 * @param sampleRate In Hertz
	 */
	bool init(long sampleRate);

	/**
	 * Tell the driver that the sound stream has paused
	 */
	void pause();

	/**
	 * Reset the sound driver
	 */
	void reset();

	/**
	 * Tell the driver that the sound stream has resumed
	 */
	void resume();

	/**
	 * Write length bytes of data from the finalWave buffer to the driver output buffer.
	 */
	void write(u16 * finalWave, int length);

	void setThrottle(unsigned short throttle);
};

#endif // __EMSCRIPTEN_SOUND_DRIVER_H__
